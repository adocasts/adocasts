import type { HttpContextContract } from '@ioc:Adonis/Core/HttpContext'
import PreferenceValidator from 'App/Validators/PreferenceValidator'

export default class PreferencesController {
  public async update({ request, response, auth, session }: HttpContextContract) {
    const data = await request.validate(PreferenceValidator)
    const user = auth.user!

    user.isEnabledProfile = !!data.isEnabledProfile
    user.isEnabledMiniPlayer = !!data.isEnabledMiniPlayer
    user.isEnabledAutoplayNext = !!data.isEnabledAutoplayNext

    await user.save()

    session.flash('success', 'Your preferences have been updated!')

    return response.redirect().back()
  }
}
