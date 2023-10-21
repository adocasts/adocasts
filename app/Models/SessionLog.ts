import { DateTime } from 'luxon'
import { BaseModel, BelongsTo, beforeSave, belongsTo, column } from '@ioc:Adonis/Lucid/Orm'
import User from './User'

export default class SessionLog extends BaseModel {
  @column({ isPrimary: true })
  public id: number

  @column()
  public userId: number

  @column()
  public token: string

  @column()
  public ipAddress: string | null

  @column()
  public userAgent: string | null

  @column()
  public city: string | null

  @column()
  public country: string | null

  @column()
  public countryCode: string | null

  @column.dateTime()
  public lastTouchedAt: DateTime | null

  @column.dateTime()
  public loginAt: DateTime | null

  @column()
  public loginSuccessful: boolean

  @column.dateTime()
  public logoutAt: DateTime | null

  @column()
  public forceLogout: boolean

  @column.dateTime({ autoCreate: true })
  public createdAt: DateTime

  @column.dateTime({ autoCreate: true, autoUpdate: true })
  public updatedAt: DateTime

  @belongsTo(() => User)
  public user: BelongsTo<typeof User>
}
