import { inject } from '@adonisjs/core/build/standalone'
import type { HttpContextContract } from '@ioc:Adonis/Core/HttpContext'
import User from 'App/Models/User'
import AuthAttemptService from 'App/Services/AuthAttemptService'
import SessionLogService from 'App/Services/SessionLogService'
import StripeService from 'App/Services/StripeService'
import SignInValidator from 'App/Validators/SignInValidator'
import SignUpValidator from 'App/Validators/SignUpValidator'

@inject()
export default class AuthController {
  constructor (protected stripeService: StripeService) {}

  /**
   * Displays sign in page
   * @param param0 
   * @returns 
   */
  public async signin({ view, request }: HttpContextContract) {
    const { action } = request.qs()
    return view.render('pages/auth/signin', { action })
  }

  /**
   * Authenticates a user
   * @param param0 
   * @returns 
   */
  public async authenticate({ request, response, auth, session, up }: HttpContextContract) {
    let { uid, password, rememberMe, forward, action, plan } = await request.validate(SignInValidator)

    if (!await AuthAttemptService.hasRemainingAttempts(uid)) {
      session.flash('error', 'Your account has been locked due to repeated bad login attempts. Please reset your password.')
      return response.redirect('/forgot-password')
    }

    const sessionLogService = new SessionLogService(request, response)

    // try {
      await auth.attempt(uid, password, rememberMe)
      await sessionLogService.onSignInSuccess(auth.user!)
      await AuthAttemptService.deleteBadAttempts(uid)
    // } catch (error) {
    //   await AuthAttemptService.recordLoginAttempt(uid)

    //   session.flash('errors', { form: 'The provided username/email or password is incorrect' })
    //   return response.redirect().toRoute('auth.signin')
    // }

    switch (action) {
      case 'email_verification':
        forward = session.get('email_verification')
        break
    }

    if (plan) {
      const { status, message, checkout } = await this.stripeService.tryCreateCheckoutSession(auth.user!, plan)

      if (status === 'warning' || status === 'error') {
        session.flash(status, message)
        return response.redirect().back()
      }

      return response.redirect(checkout!.url!)
    }

    session.flash('success', `Welcome back, ${auth.user!.username}!`)

    up.setTarget('[up-main], [up-player], [up-header]')

    if (forward?.includes('signin') || forward?.includes('signup')) {
      forward = '/'
    }
    
    return response.redirect().toPath(forward ?? '/')
  }

  public async signup({ view }: HttpContextContract) {
    return view.render('pages/auth/signup')
  }

  public async register({ request, response, auth, session, up }: HttpContextContract) {
    let { forward, plan, ...data } = await request.validate(SignUpValidator)
    const user = await User.create(data)
    const sessionLogService = new SessionLogService(request, response)

    await user.related('profile').create({})
    await auth.login(user)
    await sessionLogService.onSignInSuccess(user)

    if (plan) {
      const { status, message, checkout } = await this.stripeService.tryCreateCheckoutSession(auth.user!, plan)

      if (status === 'warning' || status === 'error') {
        session.flash(status, message)
        return response.redirect().back()
      }

      return response.redirect(checkout!.url!)
    }

    session.flash('success', `Welcome to Adocasts, ${user.username}!`)

    up.setTarget('[up-main], [up-player], [up-header]')

    if (forward?.includes('signin') || forward?.includes('signup')) {
      forward = '/'
    }

    return response.redirect().toPath(forward ?? '/')
  }

  public async signout({ request, response, auth, session, up }: HttpContextContract) {
    const { forward } = request.only(['forward'])
    const user = auth.user!
    const sessionLogService = new SessionLogService(request, response)
    
    await auth.logout()
    await sessionLogService.onSignOutSuccess(user)

    session.flash('success', 'You have been signed out. Cya next time!')

    up.setTarget('[up-main], [up-header]')

    return response.redirect().toPath(forward ?? '/')
  }
}
