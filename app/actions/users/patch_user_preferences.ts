import BaseAction from '#actions/base_action'
import User from '#models/user'
import { preferencePatchValidator } from '#validators/preference'
import { HttpContext } from '@adonisjs/core/http'
import { Infer } from '@vinejs/vine/types'
import { PreferenceKeys } from './update_user_preferences.js'

type Validator = Infer<typeof preferencePatchValidator>
type HandleData = Partial<Record<PreferenceKeys, boolean>>

export default class PatchUserPreferences extends BaseAction<
  [User, Partial<Record<PreferenceKeys, boolean>>]
> {
  validator = preferencePatchValidator

  async asController({ response, session, auth }: HttpContext, data: Validator) {
    const user = auth.user!

    await this.handle(user, {
      [data.params.preference as string]: !!data.value,
    })

    session.toast('success', this.#getMessage(data.params.preference))

    return response.redirect().back()
  }

  async handle(user: User, data: HandleData) {
    await user.merge(data).save()
  }

  #getMessage(preference: Validator['params']['preference']) {
    switch (preference) {
      case 'isEnabledAutoplayNext':
        return 'Your autoplay next preference has been updated'
      case 'isEnabledMentions':
        return 'Your mentions preference has been updated'
      case 'isEnabledMiniPlayer':
        return 'Your mini player preference has been updated'
      case 'isEnabledProfile':
        return 'Your profile preference has been updated'
      default:
        return 'Your preference has been updated'
    }
  }
}
