import BaseAction from '#actions/base_action'
import Profile from '#models/profile'
import { HttpContext } from '@adonisjs/core/http'

export default class DisableAllNotifications extends BaseAction {
  async asController({ request, response, params, auth, session }: HttpContext) {
    if (!request.hasValidSignature() || (auth.user && params.userId !== auth.user.id.toString())) {
      session.flash('error', 'Link signature is expired or invalid')
      return auth.user
        ? response.redirect().toRoute('settings', { section: 'notifications' })
        : response.redirect().toRoute('home')
    }

    await this.handle(params.userId)

    session.flash('success', 'All activity based emails have been disabled')

    return auth.user
      ? response.redirect().toRoute('settings', { section: 'notifications' })
      : response.redirect().toRoute('home')
  }

  async handle(userId: number) {
    const profile = await Profile.findByOrFail('userId', userId)

    profile.emailOnAchievement = false
    profile.emailOnComment = false
    profile.emailOnCommentReply = false
    profile.emailOnNewDeviceLogin = false
    profile.emailOnWatchlist = false
    profile.emailOnMention = false

    await profile.save()
  }
}
