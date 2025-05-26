import BaseAction from '#actions/base_action'
import Profile from '#models/profile'
import User from '#models/user'
import { emailNotificationValidator } from '#validators/user_setting'
import { HttpContext } from '@adonisjs/core/http'
import { Infer } from '@vinejs/vine/types'

type Validator = Infer<typeof emailNotificationValidator>

export default class UpdateUserNotifications extends BaseAction<[User, Validator]> {
  validator = emailNotificationValidator

  async asController({ response, session, auth }: HttpContext, data: Validator) {
    await this.handle(auth.user!, data)

    session.flash('success', 'Your email notification settings have been updated')

    return response.redirect().back()
  }

  async handle(user: User, data: Validator) {
    const profile = await Profile.findByOrFail('userId', user?.id)

    profile.emailOnNewDeviceLogin = data.emailOnNewDeviceLogin ?? false
    profile.emailOnComment = data.emailOnComment ?? false
    profile.emailOnCommentReply = data.emailOnCommentReply ?? false
    profile.emailOnAchievement = data.emailOnAchievement ?? false
    profile.emailOnWatchlist = data.emailOnWatchlist ?? false
    profile.emailOnMention = data.emailOnMention ?? false

    await profile.save()

    return profile
  }
}
