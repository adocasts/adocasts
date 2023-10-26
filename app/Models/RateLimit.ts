import { DateTime } from 'luxon'
import { BaseModel, column } from '@ioc:Adonis/Lucid/Orm'

export default class RateLimit extends BaseModel {
  @column({ isPrimary: true })
  public key: string

  @column()
  public points: number

  @column.dateTime()
  public expire: DateTime
}
