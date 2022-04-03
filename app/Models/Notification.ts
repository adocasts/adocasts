import { DateTime } from 'luxon'
import { BelongsTo, belongsTo, column } from '@ioc:Adonis/Lucid/Orm'
import User from './User'
import AppBaseModel from 'App/Models/AppBaseModel'

export default class Notification extends AppBaseModel {
  @column({ isPrimary: true })
  public id: number

  @column()
  public global: boolean

  @column()
  public userId: number

  @column()
  public initiatorUserId?: number

  @column()
  public notificationTypeId: number

  @column()
  public table?: string

  @column()
  public tableId?: number

  @column()
  public title: string

  @column()
  public body: string

  @column()
  public href?: string

  @column.dateTime()
  public readAt?: DateTime

  @column.dateTime()
  public actionedAt?: DateTime

  @column.dateTime({ autoCreate: true })
  public createdAt: DateTime

  @column.dateTime({ autoCreate: true, autoUpdate: true })
  public updatedAt: DateTime

  @belongsTo(() => User)
  public user: BelongsTo<typeof User>
}
