import User from '#models/user'
import StripeService from '#services/stripe_service'
import { inject } from '@adonisjs/core'
import type { HttpContext } from '@adonisjs/core/http'

@inject()
export default class StripeSubscriptionsController {
  constructor(protected stripeService: StripeService) {}

  async checkout({ response, auth, params, session }: HttpContext) {
    const { status, message, checkout } = await this.stripeService.tryCreateCheckoutSession(
      auth.user!,
      params.slug
    )

    if (status === 'warning' || status === 'error') {
      session.flash(status, message)

      return response.redirect().back()
    }

    return response.redirect(checkout!.url!)
  }

  async success({ request, response, auth, session }: HttpContext) {
    try {
      const checkout = await this.stripeService.getCheckoutSession(request.qs().session_id)
      const user = await User.findByOrFail('stripeCustomerId', checkout.customer)

      if (checkout.payment_status !== 'paid') {
        session.flash(
          'error',
          'Your payment is still pending, please wait a moment and try refreshing your browser.'
        )
        return response.redirect().toRoute('home')
      }

      if (auth.user && auth.user.id !== user.id) {
        session.flash(
          'error',
          'There was a mis-match between the expected user and logged in user. Please try refreshing your browser to get your updated plan.'
        )
        return response.redirect().toRoute('home')
      }

      session.flash(
        'success',
        `Thank you for subscribing to Adocasts! You now have access to all of our content and perks!`
      )
      return response.redirect().toRoute('home')
    } catch (error) {
      console.log({ error })
      session.flash(
        'error',
        'Your checkout session could not be retrieved. Please wait a moment and try refreshing your browser.'
      )
      return response.redirect().toRoute('home')
    }
  }

  async portal({ response, auth }: HttpContext) {
    const portal = await this.stripeService.createCustomerPortalSession(auth.user!)
    return response.redirect(portal.url)
  }
}

