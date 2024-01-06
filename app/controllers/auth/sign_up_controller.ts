import User from '#models/user'
import { signUpValidator } from '#validators/auth_validator'
import { inject } from '@adonisjs/core'
import type { HttpContext } from '@adonisjs/core/http'
import SessionService from '#services/session_service'
import StripeService from '#services/stripe_service'

export default class SignUpController {
  /**
   * Display form to create a new record
   */
  async create({ view }: HttpContext) {
    return view.render('pages/auth/signup')
  }

  /**
   * Handle form submission for the create action
   */
  @inject()
  async store(
    { request, response, auth, session, up }: HttpContext,
    sessionService: SessionService,
    stripeService: StripeService
  ) {
    let { forward, plan, ...data } = await request.validateUsing(signUpValidator)
    const user = await User.create(data)

    await user.related('profile').create({})
    await auth.use('web').login(user)
    await sessionService.onSignInSuccess(user)

    if (plan) {
      const { status, message, checkout } = await stripeService.tryCreateCheckoutSession(
        auth.user!,
        plan
      )

      if (status === 'warning' || status === 'error') {
        session.flash(status, message)
        return response.redirect().back()
      }

      return response.redirect(checkout!.url!)
    }

    session.flash('success', `Welcome to Adocasts, ${user.username}!`)

    up.setTarget('[up-theme]')

    if (
      forward?.includes('signin') ||
      forward?.includes('signup') ||
      forward?.includes('users/menu')
    ) {
      forward = '/'
    }

    return response.redirect().toPath(forward ?? '/')
  }
}
