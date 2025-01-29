import type { HttpContext } from '@adonisjs/core/http'
import User from '#models/user'
import router from '@adonisjs/core/services/router'
import AuthAttemptService from '#services/auth_attempt_service'
import NotAllowedException from '#exceptions/not_allowed_exception'
import hash from '@adonisjs/core/services/hash'
import logger from '#services/logger_service'
import { passwordResetValidator } from '#validators/auth_validator'
import emitter from '@adonisjs/core/services/emitter'
import { inject } from '@adonisjs/core'
import SessionService from '#services/session_service'
import limiter from '@adonisjs/limiter/services/main'

export default class PasswordResetController {
  async forgotPassword({ view }: HttpContext) {
    return view.render('pages/auth/password/forgot')
  }

  async forgotPasswordSent({ view }: HttpContext) {
    return view.render('pages/auth/password/sent')
  }

  @inject()
  async forgotPasswordSend({ request, response, session }: HttpContext, sessionService: SessionService) {
    const email = request.input('email')
    const limitKey = `forgotPasswordSend_${sessionService.ipAddress}`
    const limit = limiter.use({
      requests: 3,
      duration: '1 min',
      blockDuration: '1 hour',
    })

    try {
      const [throttle, user] = await limit.penalize(limitKey, () => {
        return User.findByOrFail('email', email)
      })

      if (throttle) {
        session.flash('error', 'Too many attempts. Please try again later.')
        return response.redirect().back()
      }

      const signedUrl = router.makeSignedUrl('auth.password.reset', { email }, { expiresIn: '1h' })    
      await emitter.emit('email:password_reset', { user, signedUrl })
    } catch (_error) {}

    session.flash('success', 'If an account exists with that email, a password reset link has been sent.')
    return response.redirect().toRoute('auth.password.forgot.sent')
  }

  async resetPassword({ request, view, params }: HttpContext) {
    const isSignatureValid = request.hasValidSignature()
    const email = params.email
    const token = await hash.make(email)

    return view.render('pages/auth/password/reset', { isSignatureValid, email, token })
  }

  async resetPasswordStore({ request, response, session, auth }: HttpContext) {
    try {
      const { token, email, password } = await request.validateUsing(passwordResetValidator)

      if (!(await hash.verify(token, email))) {
        throw new NotAllowedException('The request structure is invalid.')
      }

      const user = await User.findByOrFail('email', email)
      user.password = password
      await user.save()

      await emitter.emit('email:password_reset_success', { user })

      await auth.use('web').login(user)
      await AuthAttemptService.clearAttempts(email)

      session.flash('success', 'Your password has been successfully reset')

      return response.redirect('/')
    } catch (error) {
      const { email } = request.only(['email'])
      logger.error('PasswordResetController.resetPasswordStore', { email, error })

      session.flash(
        'error',
        'Something went wrong and we may not have been able to reset your password.'
      )
      return response.redirect().back()
    }
  }
}
