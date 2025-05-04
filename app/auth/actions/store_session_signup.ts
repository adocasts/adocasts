import { signUpValidator } from '#auth/validators/auth'
import BaseAction from '#core/actions/base_action'
import GetRouteReferrer from '#general/actions/get_route_referrer'
import stripe from '#plan/services/stripe_service'
import User from '#user/models/user'
import { HttpContext } from '@adonisjs/core/http'
import { Infer } from '@vinejs/vine/types'

type Validator = Infer<typeof signUpValidator>

export default class StoreSessionSignUp extends BaseAction {
  forwardIgnore = ['signin', 'signup', 'users/menu']
  validator = signUpValidator

  async asController({ response, auth, session }: HttpContext, { options, ...data }: Validator) {
    const user = await User.create(data)

    await user.related('profile').create({})
    await auth.use('web').login(user, options.remember)

    const redirect = await this.#getRedirectLocation(session, options)
    const checkout = await this.#checkForPlan(user, options)

    if (checkout.bail) {
      session.flash(checkout.status, checkout.message)
      return checkout.redirect ? response.redirect(checkout.redirect) : response.redirect().back()
    }

    session.flash('success', `Welcome to Adocasts, ${user.handle}!`)

    return response.redirect(redirect)
  }

  async #getRedirectLocation(options: Validator['options']) {
    if (this.forwardIgnore.some((path) => options.forward?.includes(path))) {
      options.forward = '/'
    }

    switch (options.action) {
      case 'cms':
        return 'https://cms.adocasts.com'
      default:
        const match = GetRouteReferrer.run(options.forward)
        return match.referrer ?? '/'
    }
  }

  async #checkForPlan(user: User, options: Validator['options']) {
    if (!options.plan) return { bail: false, status: '', message: '' }

    const { status, message, checkout } = await stripe.tryCreateCheckoutSession(user, options.plan)

    if (['error', 'warning'].includes(status)) {
      return { status, message, bail: true }
    }

    return { status, message, bail: true, redirect: checkout!.url! }
  }
}
