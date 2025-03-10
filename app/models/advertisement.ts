import { DateTime } from 'luxon'
import { BaseModel, beforeSave, belongsTo, column, computed, hasMany } from '@adonisjs/lucid/orm'
import User from './user.js'
import type { BelongsTo, HasMany } from '@adonisjs/lucid/types/relations'
import AdvertisementSize from '#models/advertisement_size'
import Asset from './asset.js'
import States from '#enums/states'
import AdvertisementEvent from './advertisement_event.js'
import AnalyticTypes from '#enums/analytic_types'

export default class Advertisement extends BaseModel {
  @column({ isPrimary: true })
  declare id: number

  @column()
  declare userId: number

  @column()
  declare assetId: number

  @column()
  declare sizeId: number

  @column()
  declare stateId: number

  @column()
  declare url: string

  @column.dateTime()
  declare startAt: DateTime

  @column.dateTime()
  declare endAt: DateTime

  @column.dateTime({ autoCreate: true })
  declare createdAt: DateTime

  @column.dateTime({ autoCreate: true, autoUpdate: true })
  declare updatedAt: DateTime

  @computed()
  get isActive() {
    if (this.stateId !== States.PUBLIC) return false
    return DateTime.now() >= this.startAt && DateTime.now() <= this.endAt
  }

  @computed()
  get rangeDays() {
    return this.endAt.diff(this.startAt, 'days').toObject().days
  }

  @beforeSave()
  static async defaultStartAndEndDate(advertisement: Advertisement) {
    if (!advertisement.startAt) {
      advertisement.startAt = DateTime.now()
    }

    if (!advertisement.endAt) {
      advertisement.endAt = DateTime.now().plus({ months: 6 })
    }
  }

  @belongsTo(() => User)
  declare user: BelongsTo<typeof User>

  @belongsTo(() => AdvertisementSize, {
    foreignKey: 'sizeId',
  })
  declare size: BelongsTo<typeof AdvertisementSize>

  @belongsTo(() => Asset)
  declare asset: BelongsTo<typeof Asset>

  @hasMany(() => AdvertisementEvent, {
    onQuery(query) {
      query.where('typeId', AnalyticTypes.IMPRESSION)
    },
  })
  declare impressions: HasMany<typeof AdvertisementEvent>

  @hasMany(() => AdvertisementEvent, {
    onQuery(query) {
      query.where('typeId', AnalyticTypes.CLICK)
    },
  })
  declare clicks: HasMany<typeof AdvertisementEvent>
}

