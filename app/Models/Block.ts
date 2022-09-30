import { DateTime } from 'luxon'
import { BaseModel, BelongsTo, belongsTo, column } from '@ioc:Adonis/Lucid/Orm'
import User from './User'

export default class Block extends BaseModel {
  @column({ isPrimary: true })
  public id: number

  @column()
  public userId: number | null

  @column()
  public sectionId: number
  
  @column()
  public ipAddress: string
  
  @column()
  public reason: string | null
  
  @column.dateTime()
  public expiresAt: DateTime | null

  @column.dateTime({ autoCreate: true })
  public createdAt: DateTime

  @column.dateTime({ autoCreate: true, autoUpdate: true })
  public updatedAt: DateTime

  @belongsTo(() => User)
  public user: BelongsTo<typeof User>
}
