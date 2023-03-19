import type { HttpContextContract } from '@ioc:Adonis/Core/HttpContext'
import Profile from 'App/Models/Profile'
import UserSettingsService from 'App/Services/UserSettingsService'

export default class UserSettingsController {
  public async index({ view, auth }: HttpContextContract) {
    const profile = await Profile.findByOrFail('userId', auth.user!.id)

    return view.render('pages/users/settings', { profile })
  }

  public async updateUsername({ request, response, auth, session }: HttpContextContract) {
    const { username } = request.only(['username'])
    const { flashStatus, message } = await UserSettingsService.updateUsername(auth.user!, username)

    session.flash(flashStatus, message)

    return response.redirect().back()
  }
}
