import { AdvertisementEventSchema } from '#database/schema'
import { belongsTo } from '@adonisjs/lucid/orm'
import type { BelongsTo } from '@adonisjs/lucid/types/relations'
import Advertisement from './advertisement.js'

export default class AdvertisementEvent extends AdvertisementEventSchema {
  @belongsTo(() => Advertisement)
  declare advertisement: BelongsTo<typeof Advertisement>
}
