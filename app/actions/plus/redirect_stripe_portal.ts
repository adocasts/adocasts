import BaseAction from '#actions/base_action'
import stripe from '#services/stripe_service'
import { HttpContext } from '@adonisjs/core/http'

export default class RedirectStripePortal extends BaseAction {
  async asController({ response, auth }: HttpContext) {
    const portal = await stripe.createCustomerPortalSession(auth.user!)
    return response.redirect(portal.url)
  }
}
