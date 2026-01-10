import BaseAction from '#actions/base_action'
import User from '#models/user'
import stripe from '#services/stripe_service'
import { HttpContext } from '@adonisjs/core/http'

export default class HandleStripeCheckoutSuccess extends BaseAction {
  async asController({ request, response, session, auth }: HttpContext) {
    try {
      const checkout = await stripe.getCheckoutSession(request.qs().session_id)
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
}
