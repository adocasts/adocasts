import { inject } from '@adonisjs/fold';
import { HttpContextContract } from '@ioc:Adonis/Core/HttpContext'
import Profile from 'App/Models/Profile'
import User from 'App/Models/User'
import AuthSocialService from 'App/Services/Http/AuthSocialService'
import Route from '@ioc:Adonis/Core/Route'

@inject()
export default class AuthSocialController {
  constructor(public authSocialService: AuthSocialService) {}

  public async redirect ({ ally, params }: HttpContextContract) {
    await ally.use(params.provider).redirect()
  }

  public async callback ({ response, auth, params, session }: HttpContextContract) {
    const wasLoggedIn = !!auth.user
    const { isSuccess, user, message } = await this.authSocialService.getUser(params.provider)

    if (!isSuccess) {
      session.flash('errors', { form: message })
      return response.redirect().toRoute('auth.signin.show')
    }

    await auth.use('web').login(<User>user)

    const hasProfile = await Profile.findBy('userId', user?.id)
    if (!hasProfile) {
      await Profile.create({ userId: user?.id })
    }

    if (wasLoggedIn) {
      session.flash('success', `Your account was successfully tied to your ${params.provider} account`)
      return response.redirect().toRoute('studio.settings.index')
    }

    return response.redirect('/')
  }

  public async unlink ({ response, auth, params, session }: HttpContextContract) {
    if (!auth.user!.password) {
      const signedUrl = Route.makeSignedUrl('auth.password.reset', {
        params: { email: auth.user!.email },
        expiresIn: '1h'
      });

      session.flash('error', `Please create a password for your account by following the password reset flow before unlinking ${params.provider}`)
      return response.redirect(signedUrl)
    }

    await this.authSocialService.unlink(params.provider)

    session.flash('success', `Your ${params.provider} account was unlinked from your account`)

    return response.redirect().toRoute('studio.settings.index')
  }
}
