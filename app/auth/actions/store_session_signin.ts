import AuthAttempt from '#auth/models/auth_attempt'
import { signInValidator } from '#auth/validators/auth'
import BaseAction from '#core/actions/base_action'
import GetRouteReferrer from '#general/actions/get_route_referrer'
import stripe from '#plan/services/stripe_service'
import User from '#user/models/user'
import { errors } from '@adonisjs/auth'
import { HttpContext } from '@adonisjs/core/http'
import { Session } from '@adonisjs/session'
import { Infer } from '@vinejs/vine/types'

type Validator = Infer<typeof signInValidator>

export default class StoreSessionSignIn extends BaseAction {
  forwardIgnore = ['signin', 'signup', 'users/menu']
  validator = signInValidator

  async asController({ response, auth, session }: HttpContext, { options, ...data }: Validator) {
    if (await AuthAttempt.disallows(data.uid)) {
      session.flashErrors({
        form: 'Your account has been locked due to repeated bad login attempts. Please reset your password.',
      })
      return response.redirect('/forgot-password')
    }

    const user = await this.#verifyCredentials(data)

    await auth.use('web').login(user, options.remember)
    await AuthAttempt.clear(data.uid)

    const redirect = await this.#getRedirectLocation(options, session)
    const checkout = await this.#checkForPlan(user, options)

    if (checkout.bail) {
      session.flash(checkout.status, checkout.message)
      return checkout.redirect ? response.redirect(checkout.redirect) : response.redirect().back()
    }

    session.flash('success', `Welcome back, ${user.handle}!`)

    return response.redirect(redirect)
  }

  async #verifyCredentials({ uid, password }: Pick<Validator, 'uid' | 'password'>) {
    try {
      return await User.verifyCredentials(uid, password)
    } catch (error) {
      if (error instanceof errors.E_INVALID_CREDENTIALS) {
        AuthAttempt.recordBadLogin(uid)
      }
      throw error
    }
  }

  async #getRedirectLocation(options: Validator['options'], session: Session) {
    if (this.forwardIgnore.some((path) => options.forward?.includes(path))) {
      options.forward = '/'
    }

    switch (options.action) {
      case 'email_verification':
        return session.get('email_verification')
      case 'cms':
        return 'https://cms.adocasts.com'
      default:
        const match = GetRouteReferrer.run(options.forward)
        console.log({ match, options })
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
