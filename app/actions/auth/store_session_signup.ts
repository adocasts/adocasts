import { signUpValidator } from '#validators/auth'
import BaseAction from '#actions/base_action'
import GetRouteReferrer from '../general/get_route_referrer.js'
import stripe from '#services/stripe_service'
import User from '#models/user'
import { HttpContext } from '@adonisjs/core/http'
import { Infer } from '@vinejs/vine/types'
import OnSignInSucceeded from './on_signin_succeeded.js'
import { Exception } from '@adonisjs/core/exceptions'

type Validator = Infer<typeof signUpValidator>

export default class StoreSessionSignUp extends BaseAction {
  forwardIgnore = ['signin', 'signup', 'users/menu']
  validator = signUpValidator

  async asController(
    { request, response, auth, session }: HttpContext,
    { options, ...data }: Validator
  ) {
    const user = await User.create(data)

    await user.related('profile').create({})
    await auth.use('web').login(user, options?.remember)

    await OnSignInSucceeded.run({ request, response, session }, user, options?.remember)

    const redirect = await this.#getRedirectLocation(options)
    const checkout = await this.#checkForPlan(user, options)

    if (checkout.bail) {
      session.toast(checkout.status, checkout.message)
      return checkout.redirect ? response.redirect(checkout.redirect) : response.redirect().back()
    }

    session.toast('success', `Welcome to Adocasts, ${user.handle}!`)

    return response.redirect(redirect)
  }

  async #getRedirectLocation(options: Validator['options'] = {}) {
    if (this.forwardIgnore.some((path) => options.forward?.includes(path))) {
      options.forward = '/'
    }

    switch (options.action) {
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
