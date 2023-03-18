import type { HttpContextContract } from '@ioc:Adonis/Core/HttpContext'
import User from 'App/Models/User'
import AuthAttemptService from 'App/Services/AuthAttemptService'
import SignInValidator from 'App/Validators/SignInValidator'
import SignUpValidator from 'App/Validators/SignUpValidator'

export default class AuthController {
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
    let { uid, password, rememberMe, forward, action } = await request.validate(SignInValidator)

    if (!await AuthAttemptService.hasRemainingAttempts(uid)) {
      session.flash('error', 'Your account has been locked due to repeated bad login attempts. Please reset your password.')
      return response.redirect('/forgot-password')
    }

    try {
      await auth.attempt(uid, password, rememberMe)
      await AuthAttemptService.deleteBadAttempts(uid)
    } catch (error) {
      await AuthAttemptService.recordLoginAttempt(uid)

      session.flash('errors', { form: 'The provided username/email or password is incorrect' })
      return response.redirect().back()
    }

    switch (action) {
      case 'email_verification':
        forward = session.get('email_verification')
        break
    }

    session.flash('success', `Welcome back, ${auth.user!.username}!`)

    up.setTarget('[up-main], [up-player], [up-header]')
    
    return response.redirect().toPath(forward ?? '/')
  }

  public async signup({ view }: HttpContextContract) {
    return view.render('pages/auth/signup')
  }

  public async register({ request, response, auth, session, up }: HttpContextContract) {
    const { forward, ...data } = await request.validate(SignUpValidator)
    const user = await User.create(data)

    await user.related('profile').create({})
    await auth.login(user)

    session.flash('success', `Welcome to Adocasts, ${user.username}!`)

    up.setTarget('[up-main], [up-player], [up-header]')

    return response.redirect().toPath(forward ?? '/')
  }

  public async signout({ request, response, auth, session, up }: HttpContextContract) {
    const { forward } = request.only(['forward'])

    await auth.logout()

    session.flash('success', 'You have been logged out. Cya next time!')

    up.setTarget('[up-main], [up-header]')

    return response.redirect().toPath(forward ?? '/')
  }
}
