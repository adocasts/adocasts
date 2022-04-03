import { DateTime } from 'luxon'
import { column } from '@ioc:Adonis/Lucid/Orm'
import AppBaseModel from 'App/Models/AppBaseModel'

export default class AuthAttempt extends AppBaseModel {
  @column({ isPrimary: true })
  public id: number

  @column()
  uid: string

  @column()
  purposeId: number

  @column.dateTime()
  deletedAt: DateTime | null

  @column.dateTime({ autoCreate: true })
  public createdAt: DateTime

  @column.dateTime({ autoCreate: true, autoUpdate: true })
  public updatedAt: DateTime
}
