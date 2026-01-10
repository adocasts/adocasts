import BaseAction from '#actions/base_action'
import HttpStatus from '#enums/http_statuses'
import logger from '#services/logger_service'
import stripe from '#services/stripe_service'
import { HttpContext } from '@adonisjs/core/http'
import app from '@adonisjs/core/services/app'
import Stripe from 'stripe'

export default class HandleStripeWebhook extends BaseAction {
  async asController({ request, response }: HttpContext) {
    const isProd = app.inProduction
    let event: Stripe.Event

    try {
      event = await stripe.connectToWebhook(request)
    } catch (error) {
      logger.error(`StripeWebhook.run error: ${error.message}`)
      return response.status(HttpStatus.BAD_REQUEST).send(`Webhook error: ${error.message}`)
    }

    // isProd = true, then livemode should be true
    // isProd = false, then livemode should be false
    if (event.livemode !== isProd) return

    await this.handle(event)
  }

  async handle(event: Stripe.Event) {
    switch (event.type) {
      // occurs whenever a customer is signed up for a new plan
      case 'customer.subscription.created':
        await stripe.onSubscriptionCreated(event)
        break
      // occurs whenever a subscription changes (e.g., switching from one plan to another or changing status from trail to active)
      case 'customer.subscription.updated':
        await stripe.onSubscriptionUpdated(event)
        break
      // occurs whenever a customer's subscription end
      case 'customer.subscription.deleted':
        await stripe.onSubscriptionDeleted(event)
        break
      // occurs whenever a customer's subscription is paused. Only applies when subscriptions enter `status=paused`
      case 'customer.subscription.paused':
        break
      // occurs whenever a customer's subscription is no longer paused. Only applies when a `status=paused` subscription is resumed
      case 'customer.subscription.resumed':
        break
      case 'checkout.session.completed':
        await stripe.onCheckoutCompleted(event)
        break
      case 'invoice.paid':
      case 'invoice.finalized':
      case 'invoice.voided':
      case 'invoice.payment_succeeded':
        await stripe.onInvoicePaymentSucceeded(event)
        break
      default:
        console.log(`Unhandled event type ${event.type}`)
    }
  }
}
