import { inject } from '@adonisjs/fold';
import { HttpContextContract } from '@ioc:Adonis/Core/HttpContext'
import Profile from 'App/Models/Profile'
import User from 'App/Models/User'
import AuthSocialService from 'App/Services/Http/AuthSocialService'

@inject()
export default class AuthSocialController {
  constructor(public authSocialService: AuthSocialService) {}

  public async redirect ({ ally, params }: HttpContextContract) {
    await ally.use(params.provider).redirect()
  }

  public async callback ({ response, auth, params }: HttpContextContract) {
    const { isSuccess, user } = await this.authSocialService.getUser(params.provider)

    if (!isSuccess) {
      return response.redirect().toRoute('auth.signin.show')
    }

    await auth.use('web').login(<User>user)

    const hasProfile = await Profile.findBy('userId', user?.id)
    if (!hasProfile) {
      await Profile.create({ userId: user?.id })
    }

    return response.redirect('/')
  }
}
