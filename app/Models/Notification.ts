import { DateTime } from 'luxon'
import { BelongsTo, belongsTo, column, computed } from '@ioc:Adonis/Lucid/Orm'
import User from './User'
import AppBaseModel from 'App/Models/AppBaseModel'
import NotificationTypes from 'App/Enums/NotificationTypes'
import NotImplementedException from 'App/Exceptions/NotImplementedException'
import Event from '@ioc:Adonis/Core/Event'
import Profile from './Profile'
import { TransactionClientContract } from '@ioc:Adonis/Lucid/Database'

export default class Notification extends AppBaseModel {
  @column({ isPrimary: true })
  public id: number

  @column()
  public global: boolean

  @column()
  public userId: number

  @column()
  public initiatorUserId: number | null

  @column()
  public notificationTypeId: number

  @column()
  public table: string | null

  @column()
  public tableId: number | null

  @column()
  public title: string

  @column()
  public body: string

  @column()
  public href: string | null

  @column.dateTime()
  public readAt: DateTime | null

  @column.dateTime()
  public actionedAt: DateTime | null

  @column.dateTime({ autoCreate: true })
  public createdAt: DateTime

  @column.dateTime({ autoCreate: true, autoUpdate: true })
  public updatedAt: DateTime

  @belongsTo(() => User)
  public user: BelongsTo<typeof User>

  @computed()
  public get settingsField() {
    switch (this.notificationTypeId) {
      case NotificationTypes.COMMENT:
        return 'emailOnComment'
      case NotificationTypes.COMMENT_REPLY:
        return 'emailOnCommentReply'
      default:
        throw new NotImplementedException(`Settings field for type ${this.notificationTypeId} has not been defined`)
    }
  }

  @computed()
  public get settingsDescriptor() {
    switch (this.notificationTypeId) {
      case NotificationTypes.COMMENT:
        return 'comments on your content'
      case NotificationTypes.COMMENT_REPLY:
        return 'replies to one of your comments'
      default:
        throw new NotImplementedException(`Settings field for type ${this.notificationTypeId} has not been defined`)
    }
  }

  public isEmailEnabled(profile: Profile) {
    switch (this.notificationTypeId) {
      case NotificationTypes.COMMENT:
        return profile.emailOnComment
      case NotificationTypes.COMMENT_REPLY:
        return profile.emailOnCommentReply
      default:
        throw new NotImplementedException(`Email handler for type ${this.notificationTypeId} has not been defined`)
    }
  }

  public async trySendEmail(userId: number, trx: TransactionClientContract | undefined | null = undefined) {
    const user = await User.query().where({ id: userId }).preload('profile').firstOrFail()
    
    if (!this.isEmailEnabled(user.profile)) return
    if (!trx) return Event.emit('notification:send', { notification: this, user })

    trx.on('commit', () => Event.emit('notification:send', { notification: this, user }))
  }
}
