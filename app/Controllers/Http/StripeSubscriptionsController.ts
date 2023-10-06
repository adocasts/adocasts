import { inject } from '@adonisjs/core/build/standalone';
import type { HttpContextContract } from '@ioc:Adonis/Core/HttpContext'
import User from 'App/Models/User';
import StripeService from 'App/Services/StripeService';

@inject()
export default class StripeSubscriptionsController {
  constructor(protected stripeService: StripeService) {}

  public async checkout({ response, auth, params, session }: HttpContextContract) {
    const { status, message, checkout } = await this.stripeService.tryCreateCheckoutSession(auth.user!, params.slug)

    if (status === 'warning' || status === 'error') {
      session.flash(status, message)

      return response.redirect().back()
    }

    return response.redirect(checkout!.url!)
  }

  public async success({ request, response, auth, session }: HttpContextContract) {
    try {
      const checkout = await this.stripeService.getCheckoutSession(request.qs().session_id)
      const user = await User.findByOrFail('stripeCustomerId', checkout.customer)

      if (checkout.payment_status !== 'paid') {
        session.flash('error', 'Your payment is still pending, please wait a moment and try refreshing your browser.')
        return response.redirect().toRoute('home.index')
      }

      if (auth.user && auth.user.id !== user.id) {
        session.flash('error', 'There was a mis-match between the expected user and logged in user. Please try refreshing your browser to get your updated plan.')
        return response.redirect().toRoute('home.index')
      }

      session.flash('success', `Thank you for subscribing to Adocasts! You now have access to all of our content and perks!`)
      return response.redirect().toRoute('home.index')
    } catch (error) {
      console.log({ error })
      session.flash('error', 'Your checkout session could not be retrieved. Please wait a moment and try refreshing your browser.')
      return response.redirect().toRoute('home.index')
    }
  }

  public async portal({ response, auth }: HttpContextContract) {
    const portal = await this.stripeService.createCustomerPortalSession(auth.user!)
    return response.redirect(portal.url)
  }
}
