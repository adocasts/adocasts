import { preferencesValidator } from '#validators/preference_validator'
import type { HttpContext } from '@adonisjs/core/http'

export default class PreferencesController {
  public async update({ request, response, auth, session }: HttpContext) {
    const data = await request.validateUsing(preferencesValidator)
    const user = auth.user!

    user.isEnabledProfile = !!data.isEnabledProfile
    user.isEnabledMiniPlayer = !!data.isEnabledMiniPlayer
    user.isEnabledAutoplayNext = !!data.isEnabledAutoplayNext
    user.isEnabledMentions = !!data.isEnabledMentions

    await user.save()

    session.flash('success', 'Your preferences have been updated!')

    return response.redirect().back()
  }
}