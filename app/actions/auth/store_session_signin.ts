import BaseAction from '#actions/base_action'
import AuthAttempt from '#models/auth_attempt'
import User from '#models/user'
import stripe from '#services/stripe_service'
import { signInValidator } from '#validators/auth'
import { errors } from '@adonisjs/auth'
import { HttpContext } from '@adonisjs/core/http'
import { Session } from '@adonisjs/session'
import { Infer } from '@vinejs/vine/types'
import GetRouteReferrer from '../general/get_route_referrer.js'
import OnSignInSucceeded from './on_signin_succeeded.js'

type Validator = Infer<typeof signInValidator>

export default class StoreSessionSignIn extends BaseAction {
  forwardIgnore = ['signin', 'signup', 'users/menu']
  validator = signInValidator

  async asController(
    { request, response, auth, session }: HttpContext,
    { options, ...data }: Validator
  ) {
    if (await AuthAttempt.disallows(data.uid)) {
      session.flashErrors({
        form: 'Your account has been locked due to repeated bad login attempts. Please reset your password.',
      })
      return response.redirect('/forgot-password')
    }

    const user = await this.#verifyCredentials(data)

    await auth.use('web').login(user, options?.remember)
    await AuthAttempt.clear(data.uid)
    await OnSignInSucceeded.run({ request, response, session }, user, options?.remember)

    const redirect = await this.#getRedirectLocation(options, session)
    const checkout = await this.#checkForPlan(user, options)

    if (checkout.bail) {
      session.toast(checkout.status, checkout.message)
      return checkout.redirect ? response.redirect(checkout.redirect) : response.redirect().back()
    }

    session.toast('success', `Welcome back, ${user.handle}!`)

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

  async #getRedirectLocation(options: Validator['options'] = {}, session: Session) {
    if (this.forwardIgnore.some((path) => options.forward?.includes(path))) {
      options.forward = '/'
    }

    switch (options.action) {
      case 'email_verification':
        return session.get('email_verification')
      case 'cms':
        return 'https://cms.adocasts.com'
      default:
        const match = await GetRouteReferrer.run(options.forward)
        return match.referrer ?? '/'
    }
  }

  async #checkForPlan(user: User, options: Validator['options'] = {}) {
    if (!options.plan) return { bail: false, status: '', message: '' }

    const { status, message, checkout } = await stripe.tryCreateCheckoutSession(user, options.plan)

    if (['error', 'warning'].includes(status)) {
      return { status, message, bail: true }
    }

    return { status, message, bail: true, redirect: checkout!.url! }
  }
}
