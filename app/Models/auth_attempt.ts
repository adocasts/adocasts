import { DateTime } from 'luxon'
import { column } from '@adonisjs/lucid/orm'
import AppBaseModel from '#models/app_base_model'

export default class AuthAttempt extends AppBaseModel {
  @column({ isPrimary: true })
  declare id: number

  @column()
  declare uid: string

  @column()
  declare purposeId: number

  @column.dateTime()
  declare deletedAt: DateTime | null

  @column.dateTime({ autoCreate: true })
  declare createdAt: DateTime

  @column.dateTime({ autoCreate: true, autoUpdate: true })
  declare updatedAt: DateTime
}
