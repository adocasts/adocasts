import Plans from '#enums/plans'
import StripeSubscriptionStatuses from '#enums/stripe_subscription_statuses'
import Plan from '#models/plan'
import User from '#models/user'
import env from '#start/env'
import { Request } from '@adonisjs/core/http'
import app from '@adonisjs/core/services/app'
import { DateTime } from 'luxon'
import Stripe from 'stripe'
import logger from './logger_service.js'

export default class StripeService {
  static isActive: boolean = !!(env.get('STRIPE_ENABLED') ?? true)
  private stripe: Stripe
  private inTest: boolean = app.inTest
  private testSessionToPlan: Record<string, number> = {
    cs_test_a1pK9kmubhGyxPDsAAmvqlLEFAqkpWwcToOm96CFtqk0IwMDAWorXwdhmf: Plans.PLUS_MONTHLY, // monthly purchase
    cs_test_a1zSLqPTGFFUcaus1yJCgeW6MwlSFV5EBAq7caQEai8exJjvjuNcurB73A: Plans.PLUS_ANNUAL, // annual purchase
    cs_test_a1E3eqjWTAlzo3vsPCe0iiXdNQsu1Vj3EZpW5tyadLRJx70vP1CzRAKKX6: Plans.FOREVER, // forever purchase
    cs_test_a1rMtxI2beQkj8cF1MbPyjyCy4VmMsLZAICr3SY7g1LiydNIwF5Ei5bYYE: Plans.FOREVER, // mock monthly/annual upgrade to forever
  }

  // interface with stripe-mock within tests
  // https://github.com/stripe/stripe-mock#homebrew
  private testConfig: Stripe.StripeConfig = {
    host: 'localhost',
    protocol: 'http',
    port: 12111,
    apiVersion: '2023-10-16',
  }

  // use the real deal otherwise
  private realConfig: Stripe.StripeConfig = {
    apiVersion: '2023-10-16',
  }

  constructor() {
    const config = this.inTest ? this.testConfig : this.realConfig
    this.stripe = new Stripe(env.get('STRIPE_SECRET_KEY'), config)
  }

  get client() {
    return this.stripe
  }

  static toDateTime(seconds: number | undefined) {
    if (!seconds) return
    return DateTime.fromSeconds(seconds, { zone: 'UTC' })
  }

  async connectToWebhook(request: Request) {
    const sig = request.header('stripe-signature')
    return this.stripe.webhooks.constructEvent(
      request.raw() || '',
      sig || '',
      env.get('STRIPE_WEBHOOK_SECRET')
    )
  }

  async createCustomer(user: User) {
    const customer = await this.stripe.customers.create({
      email: user.email,
      description: `adocasts_user_id=${user.id}`,
    })

    user.stripeCustomerId = customer.id
    await user.save()

    return customer
  }

  async getCustomer(user: User) {
    if (!user.stripeCustomerId) return this.createCustomer(user)
    return this.stripe.customers.retrieve(user.stripeCustomerId)
  }

  async getInvoices(user: User) {
    if (!user.stripeCustomerId) return []
    const { data } = await this.stripe.invoices.list({ customer: user.stripeCustomerId })
    return data.filter(
      (invoice: any) => invoice.status && ['void', 'paid'].includes(invoice.status)
    )
  }

  async getInvoice(user: User, invoiceNumber: string) {
    const ado = await user.related('invoices').query().where({ invoiceNumber }).first()

    if (!ado) {
      return this.searchForInvoice(user, invoiceNumber)
    }

    return this.stripe.invoices.retrieve(ado.invoiceId)
  }

  async searchForInvoice(user: User, invoiceNumber: string) {
    const results = await this.stripe.invoices.search({
      query: `number:"${invoiceNumber}" AND customer:"${user.stripeCustomerId}"`,
      limit: 1,
    })

    return results.data.at(0)
  }

  async getCharges(user: User) {
    if (!user.stripeCustomerId) return []
    const { data } = await this.stripe.charges.list({ customer: user.stripeCustomerId })
    return data
  }

  async getSubscriptions(user: User) {
    if (!user.stripeCustomerId) return []
    const { data } = await this.stripe.subscriptions.list({ customer: user.stripeCustomerId })
    return data
  }

  async getPlan(priceId: string) {
    return this.stripe.plans.retrieve(priceId)
  }

  async getPlanByAdocastsId(id: number) {
    const plan = await Plan.findOrFail(id)
    return this.getPlan(plan.priceId!)
  }

  async getAdocastPlan(stripePriceId: string) {
    return env.get('NODE_ENV') === 'production'
      ? Plan.findByOrFail('stripePriceId', stripePriceId)
      : Plan.findByOrFail('stripePriceTestId', stripePriceId)
  }

  async getCheckoutSession(sessionId: string) {
    return this.stripe.checkout.sessions.retrieve(sessionId)
  }

  async getCheckoutSessionLineItemIds(sessionId: string) {
    if (this.inTest) {
      const planId = this.testSessionToPlan[sessionId]
      const plan = await Plan.findOrFail(planId)
      return [plan.priceId]
    }

    const session = await this.stripe.checkout.sessions.retrieve(sessionId, {
      expand: ['line_items.data.price.product'],
    })

    return session.line_items?.data.map((item: any) => item.price?.id).filter(Boolean)
  }

  async getSubscription(subscriptionId: string) {
    return this.stripe.subscriptions.retrieve(subscriptionId)
  }

  async tryCreateCheckoutSession(user: User, planSlug: string) {
    try {
      // if user is already a forever member, stop and prevent.
      // note: stripe will restrict to a single subscription and gracefully handle those
      if (user.planId === Plans.FOREVER) {
        return {
          status: 'warning',
          message: "You're already a member of our forever plan, so you're all set!",
        }
      }

      const checkout = await this.createCheckoutSession(user, planSlug)

      if (!checkout.url) {
        logger.error(
          'StripeService.tryCreateCheckoutSession > checkout session returned without a redirect url'
        )
        return {
          status: 'error',
          message: "Something went wrong and we couldn't create a payment link for you.",
        }
      }

      return {
        status: 'success',
        message: '',
        checkout,
      }
    } catch (error) {
      logger.error(
        'StripeService.tryCreateCheckoutSession > caught the following error',
        error.message
      )
      return {
        status: 'error',
        message: "Something went wrong and we couldn't create a payment link for you.",
      }
    }
  }

  async createCheckoutSession(user: User, planSlug: string) {
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

    const mode = plan.id === Plans.FOREVER ? 'payment' : 'subscription'
    const baseConfig =
      mode !== 'payment'
        ? {}
        : {
            invoice_creation: {
              enabled: plan.id === Plans.FOREVER,
            },
          }

    return this.stripe.checkout.sessions.create({
      ...baseConfig,
      mode,
      discounts,
      customer: customerId!,
      automatic_tax: {
        enabled: true,
      },
      allow_promotion_codes: true,
      line_items: [
        {
          price: plan.priceId!,
          quantity: 1,
        },
      ],
      tax_id_collection: {
        enabled: true,
      },
      customer_update: {
        name: 'auto',
        address: 'auto',
      },
      success_url: `${env.get(
        'APP_DOMAIN'
      )}/stripe/subscription/success?session_id={CHECKOUT_SESSION_ID}&plan_id=${plan.id}`,
      cancel_url: `${env.get('APP_DOMAIN')}`,
    })
  }

  async createCustomerPortalSession(user: User) {
    const customer = await this.getCustomer(user)

    return this.stripe.billingPortal.sessions.create({
      customer: customer.id,
      return_url: env.get('APP_DOMAIN'),
    })
  }

  async cancelCustomerSubscriptions(user: User) {
    const { data } = await this.stripe.subscriptions.list({
      limit: 1,
      status: 'active',
      customer: user.stripeCustomerId!,
    })

    if (!data?.length) return

    await this.stripe.subscriptions.cancel(data[0].id)
  }

  async onSubscriptionCreated(event: any) {
    const data = event.data.object
    const user = await User.findByOrFail('stripeCustomerId', data.customer)
    const plan = await this.getAdocastPlan(data.plan.id)

    user.planId = plan.id
    user.stripeSubscriptionStatus = data.status
    user.planPeriodStart = DateTime.fromMillis(data.current_period_start * 1000)
    user.planPeriodEnd = DateTime.fromMillis(data.current_period_end * 1000)

    await user.save()
  }

  async onSubscriptionUpdated(event: any) {
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

  async onSubscriptionDeleted(event: any) {
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

  async onCheckoutCompleted(event: any) {
    const data = event.data.object
    const user = await User.findByOrFail('stripeCustomerId', data.customer)
    const itemIds = await this.getCheckoutSessionLineItemIds(data.id)

    if (!itemIds?.length) {
      logger.info(`StripeService.onCheckoutCompleted > [${data.id}] no line items returned`)
      return
    }

    const plan = await this.getAdocastPlan(itemIds[0]!)
    const previousPlanId = user.planId

    user.planId = plan.id
    user.stripeSubscriptionStatus = data.status

    if (plan.id === Plans.FOREVER) {
      user.planPeriodStart = DateTime.now()
      user.planPeriodEnd = null
    }

    await user.save()

    // if switching to forever plan from another, cancel their subscription
    if (plan.id === Plans.FOREVER && previousPlanId) {
      await this.cancelCustomerSubscriptions(user)
    }
  }

  async onInvoicePaymentSucceeded(event: any) {
    const data = event.data.object
    const user = await User.findByOrFail('stripeCustomerId', data.customer)

    await user.related('invoices').updateOrCreate(
      { invoiceId: data.id },
      {
        invoiceId: data.id,
        invoiceNumber: data.number,
        chargeId: data.charge,
        amountDue: data.amount_due,
        amountPaid: data.amount_paid,
        amountRemaining: data.amount_remaining,
        status: data.status,
        paid: data.paid,
        periodStartAt: data.period_start ? DateTime.fromSeconds(data.period_start) : null,
        periodEndAt: data.period_end ? DateTime.fromSeconds(data.period_end) : null,
      }
    )
  }
}
