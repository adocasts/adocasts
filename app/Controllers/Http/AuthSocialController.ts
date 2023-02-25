import type { HttpContextContract } from '@ioc:Adonis/Core/HttpContext'
import Profile from 'App/Models/Profile'
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
}
