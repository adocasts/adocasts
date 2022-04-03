import { HttpContextContract } from '@ioc:Adonis/Core/HttpContext'
import User from 'App/Models/User';
import Route from '@ioc:Adonis/Core/Route'
import Mail from '@ioc:Adonis/Addons/Mail'
import { schema as Schema, rules } from '@ioc:Adonis/Core/Validator'
import AuthAttemptService from 'App/Services/AuthAttemptService';
import NotAllowedException from 'App/Exceptions/NotAllowedException'
import Hash from '@ioc:Adonis/Core/Hash'

export default class PasswordResetController {
  public async forgotPassword({ view }: HttpContextContract) {
    return view.render('auth/password/forgot')
  }

  public async forgotPasswordSent({ view }: HttpContextContract) {
    return view.render('auth/password/sent')
  }

  public async forgotPasswordSend({ request, response, session }: HttpContextContract) {
    try {
      const email = request.input('email');
      const user = await User.findByOrFail('email', email);
      const signedUrl = Route.makeSignedUrl('auth.password.reset', {
        params: { email },
        expiresIn: '1h'
      });

      if (user) {
        await Mail.sendLater(message => {
          message
            .from('noreply@jagr.co')
            .to(user.email)
            .subject('[jagr.co] Reset your password')
            .htmlView('emails/auth/password_reset', { user, signedUrl })
        })
      }

      return response.redirect().toRoute('auth.password.forgot.sent');
    } catch (error) {
      console.log({ error })
      // const email = request.input('email');
      // Logger.error('AuthController.forgotPasswordSend', { email, error })

      session.flash('error', "Something went wrong and we couldn't send your forgot password email.");

      return response.redirect().back()
    }
  }

  public async resetPassword({ request, view, params }: HttpContextContract) {
    const isSignatureValid = request.hasValidSignature();
    const email = params.email;
    const token = await Hash.make(email)

    return view.render('auth/password/reset', { isSignatureValid, email, token });
  }

  public async resetPasswordStore({ request, response, session, auth }: HttpContextContract) {
    try {
      const schema = Schema.create({
        token: Schema.string(),
        email: Schema.string({ trim: true }, [rules.exists({ table: 'users', column: 'email' })]),
        password: Schema.string({ trim: true }, [rules.minLength(8)]),
      })

      const { token, email, password } = await request.validate({ schema })

      if (!await Hash.verify(token, email)) {
        throw new NotAllowedException("The request structure is invalid.")
      }

      const user = await User.findByOrFail('email', email);
      user.password = password;
      await user.save();

      await Mail.sendLater(message => {
        message
          .from('noreply@jagr.co')
          .to(user.email)
          .subject('[jagr.co] Your password has been successfully reset')
          .htmlView('emails/auth/password_reset_success', { user })
      })

      await auth.attempt(email, password);
      await AuthAttemptService.deleteBadAttempts(email);

      session.flash('success', "Your password has been successfully reset");

      return response.redirect('/');
    } catch (error) {
      // const { email } = request.only(['email']);
      // Logger.error('AuthController.resetPasswordStore', { email, error });

      session.flash('error', "Something went wrong and we may not have been able to reset your password.");
      return response.redirect().back();
    }
  }
}
