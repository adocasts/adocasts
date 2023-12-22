import { DateTime } from 'luxon'
import { belongsTo, column, computed } from '@adonisjs/lucid/orm'
import type { BelongsTo } from '@adonisjs/lucid/types/relations'
import HistoryTypes from '#enums/history_types'
import AppBaseModel from '#models/app_base_model'
import Post from '#models/post'
import Collection from '#models/collection'
import Taxonomy from '#models/taxonomy'

export default class History extends AppBaseModel {
  @column({ isPrimary: true })
  declare id: number

  @column()
  declare userId: number

  @column()
  declare postId: number | null

  @column()
  declare collectionId: number | null

  @column()
  declare taxonomyId: number | null

  @column()
  declare historyTypeId: HistoryTypes

  @column()
  declare route: string

  @column()
  declare readPercent: number | null

  @column()
  declare watchPercent: number | null

  @column()
  declare watchSeconds: number

  @column()
  declare isCompleted: boolean

  @column.dateTime({ autoCreate: true })
  declare createdAt: DateTime

  @column.dateTime({ autoCreate: true, autoUpdate: true })
  declare updatedAt: DateTime

  @belongsTo(() => Post)
  declare post: BelongsTo<typeof Post>

  @belongsTo(() => Collection)
  declare collection: BelongsTo<typeof Collection>

  @belongsTo(() => Taxonomy)
  declare taxonomy: BelongsTo<typeof Taxonomy>

  @computed()
  public get hasActivity() {
    return (this.readPercent && this.readPercent > 0) || this.watchSeconds > 0
  }
}
