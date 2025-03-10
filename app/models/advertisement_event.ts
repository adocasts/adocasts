import { DateTime } from 'luxon'
import { BaseModel, belongsTo, column } from '@adonisjs/lucid/orm'
import type AnalyticTypes from '#enums/analytic_types'
import Advertisement from './advertisement.js'
import type { BelongsTo } from '@adonisjs/lucid/types/relations'

export default class AdvertisementEvent extends BaseModel {
  @column({ isPrimary: true })
  declare id: number

  @column()
  declare typeId: AnalyticTypes

  @column()
  declare advertisementId: number

  @column()
  declare identity: string

  @column()
  declare category: string

  @column()
  declare action: string

  @column()
  declare path: string

  @column()
  declare host: string

  @column()
  declare browser: string

  @column()
  declare browserVersion: string

  @column()
  declare os: string

  @column.dateTime({ autoCreate: true })
  declare createdAt: DateTime

  @column.dateTime({ autoCreate: true, autoUpdate: true })
  declare updatedAt: DateTime

  @belongsTo(() => Advertisement)
  declare advertisement: BelongsTo<typeof Advertisement>
}

