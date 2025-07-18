import BaseAction from '#actions/base_action'
import Profile from '#models/profile'
import { HttpContext } from '@adonisjs/core/http'

export default class DisableNotification extends BaseAction<[userId: number, fieldName: string]> {
  #fields = [
    {
      field: 'emailOnComment',
      message: `You'll no longer recieve emails when someone comments on your content`,
    },
    {
      field: 'emailOnCommentReply',
      message: `You'll no longer recieve emails when someone replies to your comments`,
    },
    {
      field: 'emailOnAchievement',
      message: `You'll no longer recieve emails when you unlock achievements`,
    },
    {
      field: 'emailOnWatchlist',
      message: `You'll no longer recieve emails when your watchlist items are updated`,
    },
    {
      field: `emailOnNewDeviceLogin`,
      message: `You'll no longer recieve emails when you log in from a new device`,
    },
    {
      field: `emailOnMention`,
      message: `You'll no longer recieve emails when someone mentions you`,
    },
  ]

  async asController({ request, response, params, auth, session }: HttpContext) {
    if (!request.hasValidSignature() || (auth.user && params.userId !== auth.user.id.toString())) {
      session.toast('error', 'Link signature is expired or invalid')
      return auth.user
        ? response.redirect().toRoute('settings', { section: 'notifications' })
        : response.redirect().toRoute('home')
    }

    const { status, message } = await this.handle(params.userId, params.field)

    session.toast(status, message)

    return auth.user
      ? response.redirect().toRoute('settings', { section: 'notifications' })
      : response.redirect().toRoute('home')
  }

  async handle(userId: number, fieldName: string) {
    const profile = await Profile.findByOrFail('userId', userId)
    const field = this.#fields.find((item) => item.field === fieldName)

    if (!field) {
      return { status: 'error', message: 'Provided field is invalid' }
    }

    await profile.merge({ [field.field]: false }).save()

    return { status: 'success', message: field.message }
  }
}
