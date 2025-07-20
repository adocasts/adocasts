import Plans from '#enums/plans'
import { UserFactory } from '#factories/user_factory'
import Plan from '#models/plan'
import User from '#models/user'
import { DateTime } from 'luxon'
import stripeService, { StripeService } from './stripe_service.js'

export default class StripeMockService {
  private stripeService: StripeService

  constructor() {
    this.stripeService = stripeService
  }

  get client() {
    return this.stripeService.client
  }

  get userFactory() {
    return UserFactory.with('profile')
  }

  async createFreeUser() {
    return this.userFactory.create()
  }

  async createFreeUserWithCustomerId() {
    const user = await this.userFactory.create()
    await this.stripeService.createCustomer(user)
    return user.refresh()
  }

  async createPlusMonthlyUser() {
    const user = await this.userFactory.create()
    const customer = await this.stripeService.createCustomer(user)

    user.stripeCustomerId = customer.id

    await user.save()

    const subscription = await this.subscribeToPlusMonthly(user)
    const plan = await this.stripeService.getPlanByAdocastsId(Plans.PLUS_MONTHLY)

    await this.stripeService.onSubscriptionCreated({
      data: {
        object: {
          ...subscription,
          plan,
        },
      },
    })

    return { user: await user.refresh(), subscription }
  }

  async createPlusAnnualUser() {
    const user = await this.userFactory.create()
    const customer = await this.stripeService.createCustomer(user)

    user.stripeCustomerId = customer.id

    await user.save()

    const subscription = await this.subscribeToPlusAnnual(user)
    const plan = await this.stripeService.getPlanByAdocastsId(Plans.PLUS_ANNUAL)

    await this.stripeService.onSubscriptionCreated({
      data: {
        object: {
          ...subscription,
          plan,
        },
      },
    })

    return { user: await user.refresh(), subscription }
  }

  async createPlusForverUser() {
    const user = await this.userFactory.create()
    const customer = await this.stripeService.createCustomer(user)

    user.stripeCustomerId = customer.id
    user.planId = Plans.FOREVER
    user.planPeriodStart = DateTime.now()

    await user.save()

    return { user }
  }

  async subscribeToPlusMonthly(user: User) {
    const plan = await Plan.findOrFail(Plans.PLUS_MONTHLY)
    return this.client.subscriptions.create({
      customer: user.stripeCustomerId!,
      items: [
        {
          price: plan.priceId!,
          quantity: 1,
        },
      ],
    })
  }

  async subscribeToPlusAnnual(user: User) {
    const plan = await Plan.findOrFail(Plans.PLUS_ANNUAL)
    return this.client.subscriptions.create({
      customer: user.stripeCustomerId!,
      items: [
        {
          price: plan.priceId!,
          quantity: 1,
        },
      ],
    })
  }

  async webhookWrapper(details: any) {
    return { data: details }
  }
}
