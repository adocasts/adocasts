import BaseAction from '#actions/base_action'
import User from '#models/user'
import { preferencesValidator } from '#validators/preference'
import { HttpContext } from '@adonisjs/core/http'
import { Infer } from '@vinejs/vine/types'

type Validator = Infer<typeof preferencesValidator>
export type PreferenceKeys = keyof Pick<
  User,
  | 'isEnabledAutoplayNext'
  | 'isEnabledMentions'
  | 'isEnabledMiniPlayer'
  | 'isEnabledProfile'
  | 'defaultLessonPanel'
>

export default class UpdateUserPreferences extends BaseAction {
  validator = preferencesValidator

  async asController({ response, session, auth }: HttpContext, data: Validator) {
    const user = auth.user!

    await this.handle(user, {
      isEnabledAutoplayNext: !!data.isEnabledAutoplayNext,
      isEnabledMentions: !!data.isEnabledMentions,
      isEnabledMiniPlayer: !!data.isEnabledMiniPlayer,
      isEnabledProfile: !!data.isEnabledProfile,
      defaultLessonPanel: data.defaultLessonPanel || user.defaultLessonPanel,
    })

    session.flash('success', 'Your preferences have been updated!')

    return response.redirect().back()
  }

  async handle(user: User, data: Partial<Pick<User, PreferenceKeys>>) {
    await user.merge(data).save()
  }
}
