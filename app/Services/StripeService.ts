import Env from '@ioc:Adonis/Core/Env'
import Plans from 'App/Enums/Plans'
import Plan from 'App/Models/Plan'
import User from 'App/Models/User'
import { DateTime } from 'luxon'
import { RequestContract } from '@ioc:Adonis/Core/Request'
import Stripe from 'stripe'
import DiscordLogger from '@ioc:Logger/Discord'
import StripeSubscriptionStatuses from 'App/Enums/StripeSubscriptionStatuses'
import Application from '@ioc:Adonis/Core/Application'

export default class StripeService {
  private stripe: Stripe
  private inTest: boolean = Application.inTest
  
  // interface with stripe-mock within tests
  // https://github.com/stripe/stripe-mock#homebrew
  private testConfig: Stripe.StripeConfig = {
    host: 'localhost',
    protocol: 'http',
    port: 12111,
    apiVersion: '2022-11-15'
  }

  // use the real deal otherwise
  private realConfig: Stripe.StripeConfig = {
    apiVersion: '2022-11-15'
  }

  constructor() {
    const config = this.inTest ? this.testConfig : this.realConfig
    this.stripe = new Stripe(Env.get('STRIPE_SECRET_KEY'), config)
  }

  public get client() {
    return this.stripe
  }

  public async connectToWebhook(request: RequestContract) {
    const sig = request.header('stripe-signature')
    return this.stripe.webhooks.constructEvent(request.raw() || '', sig || '', Env.get('STRIPE_WEBHOOK_SECRET'))
  }

  public async createCustomer(user: User) {
    const customer = await this.stripe.customers.create({
      email: user.email,
      description: `adocasts_user_id=${user.id}`
    })

    user.stripeCustomerId = customer.id
    await user.save()

    return customer
  }

  public async getCustomer(user: User) {
    if (!user.stripeCustomerId) return this.createCustomer(user)
    return this.stripe.customers.retrieve(user.stripeCustomerId)
  }

  public async getInvoices(user: User) {
    if (!user.stripeCustomerId) return []
    const { data } = await this.stripe.invoices.list({ customer: user.stripeCustomerId })
    return data
  }

  public async getCharges(user: User) {
    if (!user.stripeCustomerId) return []
    const { data } = await this.stripe.charges.list({ customer: user.stripeCustomerId })
    return data
  }

  public async getSubscriptions(user: User) {
    if (!user.stripeCustomerId) return []
    const { data } = await this.stripe.subscriptions.list({ customer: user.stripeCustomerId })
    return data
  }

  public async getPlan(priceId: string) {
    return this.stripe.plans.retrieve(priceId)
  }

  public async getPlanByAdocastsId(id: number) {
    const plan = await Plan.findOrFail(id)
    return this.getPlan(plan.priceId!)
  }

  public async getAdocastPlan(stripePriceId: string) {
    return Env.get('NODE_ENV') === 'production'
      ? Plan.findByOrFail('stripePriceId', stripePriceId)
      : Plan.findByOrFail('stripePriceTestId', stripePriceId)
  }

  public async getCheckoutSession(sessionId: string) {
    return this.stripe.checkout.sessions.retrieve(sessionId)
  }

  public async getCheckoutSessionLineItemIds(sessionId: string) {
    if (this.inTest) return [(await Plan.findOrFail(Plans.FOREVER)).priceId]

    const session = await this.stripe.checkout.sessions.retrieve(sessionId, {
      expand: ['line_items.data.price.product']
    })

    return session.line_items?.data.map(item => item.price?.id).filter(Boolean)
  }

  public async getSubscription(subscriptionId: string) {
    return this.stripe.subscriptions.retrieve(subscriptionId)
  }

  public async tryCreateCheckoutSession(user: User, planSlug: string) {
    try {
      // if user is already a forever member, stop and prevent.
      // note: stripe will restrict to a single subscription and gracefully handle those
      if (user.planId === Plans.FOREVER) {
        return { 
          status: 'warning',
          message: "You're already a member of our forever plan, so you're all set!" 
        }
      }

      const checkout = await this.createCheckoutSession(user, planSlug)

      if (!checkout.url) {
        DiscordLogger.error('StripeService.tryCreateCheckoutSession > checkout session returned without a redirect url')
        return {
          status: 'error',
          message: "Something went wrong and we couldn't create a payment link for you."
        }
      }

      return {
        status: 'success',
        message: '',
        checkout
      }
    } catch (error) {
      DiscordLogger.error('StripeService.tryCreateCheckoutSession > caught the following error', error.message)
      return {
        status: 'error',
        message: "Something went wrong and we couldn't create a payment link for you."
      }
    }
  }

  public async createCheckoutSession(user: User, planSlug: string) {
    const plan = await Plan.findByOrFail('slug', planSlug)
    const discounts: Stripe.Checkout.SessionCreateParams.Discount[] = []
    let customerId = user.stripeCustomerId

    if (!user.stripeCustomerId) {
      const customer = await this.createCustomer(user)
      customerId = customer.id
    }

    if (plan.hasActiveSale && plan.stripeCouponId) {
      discounts.push({ coupon: plan.stripeCouponId })
    }

    return this.stripe.checkout.sessions.create({
      discounts,
      mode: plan.id === Plans.FOREVER ? 'payment' : 'subscription',
      customer: customerId!,
      line_items: [{ 
        price: plan.priceId!, 
        quantity: 1 
      }],
      success_url: `${Env.get('APP_DOMAIN')}/stripe/subscription/success?session_id={CHECKOUT_SESSION_ID}&plan_id=${plan.id}`,
      cancel_url: `${Env.get('APP_DOMAIN')}`
    })
  }

  public async createCustomerPortalSession(user: User) {
    const customer = await this.getCustomer(user)
    
    return this.stripe.billingPortal.sessions.create({
      customer: customer.id,
      return_url: Env.get('APP_DOMAIN')
    })
  }

  public async cancelCustomerSubscriptions(user: User) {
    const { data } = await this.stripe.subscriptions.list({ 
      limit: 1, 
      status: 'active', 
      customer: user.stripeCustomerId! 
    })

    if (!data?.length) return

    await this.stripe.subscriptions.del(data[0].id)
  }

  public async onSubscriptionCreated(event: any) {
    const data = event.data.object
    const user = await User.findByOrFail('stripeCustomerId', data.customer)
    const plan = await this.getAdocastPlan(data.plan.id)
    
    user.planId = plan.id
    user.stripeSubscriptionStatus = data.status
    user.planPeriodStart = DateTime.fromMillis(data.current_period_start * 1000)
    user.planPeriodEnd = DateTime.fromMillis(data.current_period_end * 1000)

    await user.save()
  }

  public async onSubscriptionUpdated(event: any) {
    const data = event.data.object
    const user = await User.findByOrFail('stripeCustomerId', data.customer)
    const plan = await this.getAdocastPlan(data.plan.id)
    
    // forever is forever
    if (user.planId === Plans.FOREVER) return

    user.planId = plan?.id || Plans.FREE
    user.planPeriodStart = DateTime.fromMillis(data.current_period_start * 1000)
    user.planPeriodEnd = DateTime.fromMillis(data.current_period_end * 1000)
    user.stripeSubscriptionStatus = data.status
    user.stripeSubscriptionCanceledAt = null
    user.stripeSubscriptionPausedAt = null

    if (data.canceled_at) {
      user.stripeSubscriptionCanceledAt = DateTime.fromSeconds(data.created)
    }

    if (data.pause_collection) {
      user.stripeSubscriptionStatus = StripeSubscriptionStatuses.PAUSED
      user.stripeSubscriptionPausedAt = DateTime.fromSeconds(data.created)
    }

    await user.save()
  }

  public async onSubscriptionDeleted(event: any) {
    const data = event.data.object
    const user = await User.findByOrFail('stripeCustomerId', data.customer)

    // forever is forever
    if (user.planId === Plans.FOREVER) return

    user.planId = Plans.FREE
    user.stripeSubscriptionStatus = StripeSubscriptionStatuses.CANCELED
    user.planPeriodStart = null
    user.planPeriodEnd = null

    await user.save()
  }

  public async onCheckoutCompleted(event: any) {
    // let subscription hooks handle subscriptions
    if (event.data.object.mode !== 'payment') return
    
    const data = event.data.object
    const user = await User.findByOrFail('stripeCustomerId', data.customer)
    const itemIds = await this.getCheckoutSessionLineItemIds(data.id)

    if (!itemIds?.length) {
      DiscordLogger.info(`StripeService.onCheckoutCompleted > [${data.id}] no line items returned`)
      return
    }
    
    const plan = await this.getAdocastPlan(itemIds[0]!)
    const previousPlanId = user.planId

    user.planId = plan.id
    user.planPeriodStart = DateTime.now()
    user.planPeriodEnd = null

    await user.save()

    // if switching to forever plan from another, cancel their subscription
    if (plan.id === Plans.FOREVER && previousPlanId) {
      await this.cancelCustomerSubscriptions(user)
    }
  }
}