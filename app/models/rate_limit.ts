import { DateTime } from 'luxon'
import { BaseModel, column } from '@adonisjs/lucid/orm'

export default class RateLimit extends BaseModel {
  @column({ isPrimary: true })
  declare key: string

  @column()
  declare points: number

  @column.dateTime()
  declare expire: DateTime
}
