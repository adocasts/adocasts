import { HttpContextContract } from '@ioc:Adonis/Core/HttpContext'
import User from 'App/Models/User'
import AuthAttemptService from 'App/Services/AuthAttemptService'
import SignUpValidator from 'App/Validators/SignUpValidator'
import SignInValidator from 'App/Validators/SignInValidator'
import InvalidException from 'App/Exceptions/InvalidException'
import Hash from '@ioc:Adonis/Core/Hash'

export default class AuthController {
  public async signupShow({ view, request, response, session, auth }: HttpContextContract) {
    if (auth.user) {
      session.flash('warn', "You're already logged in.")
      return response.redirect().toRoute('home')
    }

    const referrer = request.header('referrer')

    return view.render('auth/signup', { referrer })
  }

  public async signup({ request, response, auth, session }: HttpContextContract) {
    const { forward, ...data } = await request.validate(SignUpValidator)
    const user = await User.create(data)

    await user.related('profile').create({})
    await auth.login(user)

    session.flash('success', 'Welcome to Adocasts!')

    return forward
      ? response.redirect().toPath(forward)
      : response.redirect().toPath('/')
  }

  public async signinShow({ view, request, response, session, auth }: HttpContextContract) {
    if (auth.user) {
      session.flash('warn', "You're already logged in.")
      return response.redirect().toRoute('home')
    }

    const referrer = request.header('referrer')

    return view.render('auth/signin', { referrer })
  }

  public async signin({ request, response, auth, session }: HttpContextContract) {
    const { uid, password, remember_me, forward } = await request.validate(SignInValidator)

    const loginAttemptsRemaining = await AuthAttemptService.getRemainingAttempts(uid)
    if (loginAttemptsRemaining <= 0) {
      session.flash('error', 'Your account has been locked due to repeated bad login attempts. Please reset your password.')
      return response.redirect('/forgot-password')
    }

    try {
      await auth.attempt(uid, password, remember_me)
      await AuthAttemptService.deleteBadAttempts(uid)
      
      // if (Hash.needsReHash(password)) {
      //   const user = auth.user!
      //   user.password = await Hash.make(password)
      //   user.$extras.rehash = true
      //   await user.save()
      // }
    } catch (error) {
      await AuthAttemptService.recordLoginAttempt(uid)

      session.flash('errors', { form: 'The provided username/email or password is incorrect' })
      throw new InvalidException('The provided username/email or password is incorrect')
    }

    session.flash('success', `Welcome back, ${auth.user!.username}!`)
    
    return forward
      ? response.redirect().toPath(forward)
      : response.redirect().toPath('/')
  }

  public async signout({ response, auth, session }: HttpContextContract) {
    await auth.logout()

    session.flash('success', 'You have been logged out')

    return response.redirect().toRoute('home')
  }
}
