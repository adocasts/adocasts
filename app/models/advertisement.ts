import { AdvertisementSchema } from '#database/schema'
import AnalyticTypes from '#enums/analytic_types'
import States from '#enums/states'
import AdvertisementSize from '#models/advertisement_size'
import Asset from '#models/asset'
import User from '#models/user'
import { beforeSave, belongsTo, computed, hasMany } from '@adonisjs/lucid/orm'
import type { BelongsTo, HasMany } from '@adonisjs/lucid/types/relations'
import { DateTime } from 'luxon'
import AdvertisementEvent from './advertisement_event.js'

export default class Advertisement extends AdvertisementSchema {
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
