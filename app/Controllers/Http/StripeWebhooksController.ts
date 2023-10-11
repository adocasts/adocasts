import type { HttpContextContract } from '@ioc:Adonis/Core/HttpContext'
import { inject } from '@adonisjs/core/build/standalone'
import StripeService from 'App/Services/StripeService'
import Application from '@ioc:Adonis/Core/Application'

@inject()
export default class StripeWebhooksController {
  constructor(protected stripeService: StripeService) {}

  public async index({ request, response }: HttpContextContract) {
    let event
    const isProd = Application.inProduction

    try {
      event = await this.stripeService.connectToWebhook(request)
    } catch (error) {
      return response.status(400).send(`Webhook error: ${error.message}`)
    }

    // isProd = true, then livemode should be true
    // isProd = false, then livemode should be false
    if (event.data.object.livemode != isProd) return
    
    switch (event.type) {
      // occurs whenever a customer is signed up for a new plan
      case 'customer.subscription.created':
        await this.stripeService.onSubscriptionCreated(event)
        break
      // occurs whenever a subscription changes (e.g., switching from one plan to another or changing status from trail to active)
      case 'customer.subscription.updated':
        await this.stripeService.onSubscriptionUpdated(event)
        break
      // occurs whenever a customer's subscription end
      case 'customer.subscription.deleted':
        await this.stripeService.onSubscriptionDeleted(event)
        break
      // occurs whenever a customer's subscription is paused. Only applies when subscriptions enter `status=paused`
      case 'customer.subscription.paused':
        break
      // occurs whenever a customer's subscription is no longer paused. Only applies when a `status=paused` subscription is resumed
      case 'customer.subscription.resumed':
        break
      case 'checkout.session.completed':
        await this.stripeService.onCheckoutCompleted(event)
        break
      default:
        console.log(`Unhandled event type ${event.type}`);
    }

    return
  }
}
