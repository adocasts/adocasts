import BaseAction from '#actions/base_action'
import stripe from '#services/stripe_service'
import { HttpContext } from '@adonisjs/core/http'

export default class RedirectStripeCheckout extends BaseAction {
  async asController({ response, auth, params, session }: HttpContext) {
    const { status, message, checkout } = await stripe.tryCreateCheckoutSession(
      auth.user!,
      params.slug
    )

    if (status === 'warning' || status === 'error') {
      session.toast(status, message)

      return response.redirect().back()
    }

    return response.redirect(checkout!.url!)
  }
}
