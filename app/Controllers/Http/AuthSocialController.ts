import type { HttpContextContract } from '@ioc:Adonis/Core/HttpContext'
import Profile from 'App/Models/Profile'
import Route from '@ioc:Adonis/Core/Route'
import AuthSocialService from 'App/Services/AuthSocialService'

export default class AuthSocialController {
  public async redirect ({ ally, params }: HttpContextContract) {
    await ally.use(params.provider).redirect()
  }

  public async callback ({ response, auth, ally, params, session }: HttpContextContract) {
    const { success, user, message } = await AuthSocialService.getUser(auth, ally, params.provider)

    if (!success) {
      session.flash('errors', { form: message })
      return response.redirect().toRoute('auth.signin')
    }

    await auth.login(user!, true)

    const hasProfile = await Profile.findBy('userId', user!.id)
    if (!hasProfile) {
      await user?.related('profile').create({})
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

    await AuthSocialService.unlink(auth.user!, params.provider)

    session.flash('success', `Your ${params.provider} account was unlinked from your account`)

    return response.redirect().toRoute('studio.settings.index')
  }
}
