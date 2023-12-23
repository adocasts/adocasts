import type { HttpContext } from '@adonisjs/core/http'
import User from '#models/user'
import router from '@adonisjs/core/services/router'
import mail from '@adonisjs/mail/services/main'
import AuthAttemptService from '#services/auth_attempt_service'
import NotAllowedException from '#exceptions/not_allowed_exception'
import hash from '@adonisjs/core/services/hash'
import logger from '#services/logger_service'
import env from '#start/env'
import { passwordResetValidator } from '#validators/auth_validator'
import emitter from '@adonisjs/core/services/emitter'

export default class PasswordResetController {
  public async forgotPassword({ view }: HttpContext) {
    return view.render('pages/auth/password/forgot')
  }

  public async forgotPasswordSent({ view }: HttpContext) {
    return view.render('pages/auth/password/sent')
  }

  public async forgotPasswordSend({ request, response }: HttpContext) {
    const email = request.input('email')
    const user = await User.findBy('email', email)
    const signedUrl = router.makeSignedUrl('auth.password.reset', { email }, { expiresIn: '1h' })
    
    if (user) {
      await emitter.emit('email:password_reset', { user, signedUrl })
    }

    return response.redirect().toRoute('auth.password.forgot.sent');
  }

  public async resetPassword({ request, view, params }: HttpContext) {
    const isSignatureValid = request.hasValidSignature();
    const email = params.email;
    const token = await hash.make(email)

    return view.render('pages/auth/password/reset', { isSignatureValid, email, token });
  }

  public async resetPasswordStore({ request, response, session, auth }: HttpContext) {
    try {
      const { token, email, password } = await request.validateUsing(passwordResetValidator)

      if (!await hash.verify(token, email)) {
        throw new NotAllowedException("The request structure is invalid.")
      }

      const user = await User.findByOrFail('email', email);
      user.password = password;
      await user.save();

      await emitter.emit('email:password_reset_success', { user })

      await auth.use('web').attempt(email, password);
      await AuthAttemptService.clearAttempts(email);

      session.flash('success', "Your password has been successfully reset");

      return response.redirect('/');
    } catch (error) {
      console.log({ error, message: error.message })
      const { email } = request.only(['email']);
      logger.error('AuthController.resetPasswordStore', { email, error });

      session.flash('error', "Something went wrong and we may not have been able to reset your password.");
      return response.redirect().back();
    }
  }
}