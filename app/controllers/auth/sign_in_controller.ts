import AuthAttempt from '#models/auth_attempt'
import User from '#models/user'
// import posthog from '#services/posthog_service'
import SessionService from '#services/session_service'
import StripeService from '#services/stripe_service'
import { forwardValidator, signInValidator } from '#validators/auth_validator'
import { inject } from '@adonisjs/core'
import type { HttpContext } from '@adonisjs/core/http'

export default class SignInController {
  /**
   * Display form to create a new record
   */
  async create({ view, request }: HttpContext) {
    const action = request.input('action')

    return view.render('pages/auth/signin', { action })
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
    let user: User | null = null
    let forward: string | null = null
    let { uid, password, rememberMe, action, plan } =
      await request.validateUsing(signInValidator)

    try {
      const forwardData = await request.validateUsing(forwardValidator)
      forward = forwardData.forward || null
    } catch (_) {}

    if (await AuthAttempt.disallows(uid)) {
      session.flash(
        'error',
        'Your account has been locked due to repeated bad login attempts. Please reset your password'
      )
      return response.redirect('/forgot-password')
    }

    try {
      user = await User.verifyCredentials(uid, password)
      await auth.use('web').login(user, rememberMe)
    } catch (error) {
      await AuthAttempt.recordBadLogin(uid)
      session.flash('errors', { form: 'The provided username/email or password is incorrect' })
      return response.redirect().toRoute('auth.signin.create')
    }

    await sessionService.onSignInSuccess(user, rememberMe)
    await AuthAttempt.clear(uid)
    // await posthog.onAuthenticated(user)

    switch (action) {
      case 'email_verification':
        forward = session.get('email_verification')
        break
      case 'cms':
        if (user.isAdmin || user.isContributor) {
          return response.redirect('https://cms.adocasts.com')
        }
        break
    }

    if (plan) {
      const { status, message, checkout } = await stripeService.tryCreateCheckoutSession(user, plan)

      if (status === 'warning' || status === 'error') {
        session.flash(status, message)
        return response.redirect().back()
      }

      return response.redirect(checkout!.url!)
    }

    session.flash('success', `Welcome back, ${user.username}`)

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
