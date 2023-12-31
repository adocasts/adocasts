import AuthAttempt from '#models/auth_attempt'
import SessionService from '#services/session_service'
import StripeService from '#services/stripe_service'
import { signInValidator } from '#validators/auth_validator'
import { inject } from '@adonisjs/core'
import type { HttpContext } from '@adonisjs/core/http'

export default class SignInController {
  /**
   * Display form to create a new record
   */
  async create({ view }: HttpContext) {
    return view.render('pages/auth/signin')
  }

  /**
   * Handle form submission for the create action
   */
  @inject()
  async store({ request, response, auth, session, up }: HttpContext, sessionService: SessionService, stripeService: StripeService) {
    let { uid, password, rememberMe, forward, action, plan } = await request.validateUsing(signInValidator)
    
    if (await AuthAttempt.disallows(uid)) {
      session.flash('error', 'Your account has been locked due to repeated bad login attempts. Please reset your password')
      return response.redirect('/forgot-password')
    }

    try {
      await auth.use('web').attempt(uid, password, rememberMe)
      await sessionService.onSignInSuccess(auth.user!, rememberMe)
      await AuthAttempt.clear(uid)
    } catch (error) {
      await AuthAttempt.recordBadLogin(uid)

      session.flash('errors', { form: 'The provided username/email or password is incorrect' })

      return response.redirect().toRoute('auth.signin.create')
    }

    switch (action) {
      case 'email_verification':
        forward = session.get('email_verification')
        break
    }

    if (plan) {
      const { status, message, checkout } = await stripeService.tryCreateCheckoutSession(auth.user!, plan)

      if (status === 'warning' || status === 'error') {
        session.flash(status, message)
        return response.redirect().back()
      }

      return response.redirect(checkout!.url!)
    }

    session.flash('success', `Welcome back, ${auth.user!.username}`)

    up.setTarget('[up-theme]')
    
    if (forward?.includes('signin') || forward?.includes('signup') || forward?.includes('users/menu')) {
      forward = '/'
    }
    
    return response.redirect().toPath(forward ?? '/')
  }
}