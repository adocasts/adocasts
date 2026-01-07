import HistoryBuilder from '#builders/history_builder'
import { HistorySchema } from '#database/schema'
import Collection from '#models/collection'
import Post from '#models/post'
import Taxonomy from '#models/taxonomy'
import { belongsTo } from '@adonisjs/lucid/orm'
import type { BelongsTo } from '@adonisjs/lucid/types/relations'

export default class History extends HistorySchema {
  static build = () => HistoryBuilder.new()

  @belongsTo(() => Post)
  declare post: BelongsTo<typeof Post>

  @belongsTo(() => Collection)
  declare collection: BelongsTo<typeof Collection>

  @belongsTo(() => Taxonomy)
  declare taxonomy: BelongsTo<typeof Taxonomy>
}
