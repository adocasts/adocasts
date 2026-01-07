import { NotificationSchema } from '#database/schema'
import NotificationTypes from '#enums/notification_types'
import NotImplementedException from '#exceptions/not_implemented_exception'
import Profile from '#models/profile'
import User from '#models/user'
import Emitter from '@adonisjs/core/services/emitter'
import { belongsTo, computed } from '@adonisjs/lucid/orm'
import { TransactionClientContract } from '@adonisjs/lucid/types/database'
import type { BelongsTo } from '@adonisjs/lucid/types/relations'

export default class Notification extends NotificationSchema {
  @belongsTo(() => User)
  declare user: BelongsTo<typeof User>

  @computed()
  get settingsField() {
    switch (this.notificationTypeId) {
      case NotificationTypes.COMMENT:
        return 'emailOnComment'
      case NotificationTypes.COMMENT_REPLY:
        return 'emailOnCommentReply'
      case NotificationTypes.MENTION:
        return 'emailOnMention'
      default:
        throw new NotImplementedException(
          `Settings field for type ${this.notificationTypeId} has not been defined`
        )
    }
  }

  @computed()
  get settingsDescriptor() {
    switch (this.notificationTypeId) {
      case NotificationTypes.COMMENT:
        return 'comments on your content'
      case NotificationTypes.COMMENT_REPLY:
        return 'replies to one of your comments'
      case NotificationTypes.MENTION:
        return 'others mention you in their content'
      default:
        throw new NotImplementedException(
          `Settings field for type ${this.notificationTypeId} has not been defined`
        )
    }
  }

  isEmailEnabled(profile: Profile) {
    switch (this.notificationTypeId) {
      case NotificationTypes.COMMENT:
        return profile.emailOnComment
      case NotificationTypes.COMMENT_REPLY:
        return profile.emailOnCommentReply
      case NotificationTypes.MENTION:
        return profile.emailOnMention
      default:
        throw new NotImplementedException(
          `Email handler for type ${this.notificationTypeId} has not been defined`
        )
    }
  }

  async trySendEmail(
    userId: number,
    trx: TransactionClientContract | undefined | null = undefined
  ) {
    const user = await User.query().where({ id: userId }).preload('profile').firstOrFail()

    if (!this.isEmailEnabled(user.profile)) return
    if (!trx) return Emitter.emit('notification:send', { notification: this, user })

    trx.on('commit', () => Emitter.emit('notification:send', { notification: this, user }))
  }
}
