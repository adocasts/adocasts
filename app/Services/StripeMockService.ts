import Plans from "App/Enums/Plans";
import StripeService from "./StripeService";
import { UserFactory } from "Database/factories/UserFactory";
import Plan from "App/Models/Plan";
import { DateTime } from "luxon";
import User from "App/Models/User";

export default class StripeMockService {
  private stripeService: StripeService

  constructor() {
    this.stripeService = new StripeService()
  }

  public get client() {
    return this.stripeService.client
  }

  public get userFactory() {
    return UserFactory.with('profile')
  }

  public async createFreeUser() {
    return this.userFactory.create()
  }

  public async createFreeUserWithCustomerId() {
    const user = await this.userFactory.create()
    await this.stripeService.createCustomer(user)
    return user.refresh()
  }

  public async createPlusMonthlyUser() {
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
          plan
        }
      }
    })

    return { user: await user.refresh(), subscription }
  }

  public async createPlusAnnualUser() {
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
          plan
        }
      }
    })

    return { user: await user.refresh(), subscription }
  }

  public async createPlusForverUser() {
    const user = await this.userFactory.create()
    const customer = await this.stripeService.createCustomer(user)

    user.stripeCustomerId = customer.id
    user.planId = Plans.FOREVER
    user.planPeriodStart = DateTime.now()

    await user.save()

    return { user }
  }

  public async subscribeToPlusMonthly(user: User) {
    const plan = await Plan.findOrFail(Plans.PLUS_MONTHLY)
    return this.client.subscriptions.create({
      customer: user.stripeCustomerId!,
      items: [{
        price: plan.priceId!,
        quantity: 1
      }]
    })
  }

  public async subscribeToPlusAnnual(user: User) {
    const plan = await Plan.findOrFail(Plans.PLUS_ANNUAL)
    return this.client.subscriptions.create({
      customer: user.stripeCustomerId!,
      items: [{
        price: plan.priceId!,
        quantity: 1
      }]
    })
  }

  public async webhookWrapper(details: any) {
    return { data: details }
  }
}