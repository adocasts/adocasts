import { WatchlistSchema } from '#database/schema'
import Collection from '#models/collection'
import Post from '#models/post'
import Taxonomy from '#models/taxonomy'
import User from '#models/user'
import { belongsTo } from '@adonisjs/lucid/orm'
import type { BelongsTo } from '@adonisjs/lucid/types/relations'

export default class Watchlist extends WatchlistSchema {
  @belongsTo(() => User)
  declare user: BelongsTo<typeof User>

  @belongsTo(() => Post)
  declare post: BelongsTo<typeof Post>

  @belongsTo(() => Collection)
  declare collection: BelongsTo<typeof Collection>

  @belongsTo(() => Taxonomy)
  declare taxonomy: BelongsTo<typeof Taxonomy>

  static async forCollection(userId: number | undefined, collectionId: number) {
    if (!userId) return false
    const result = await this.query().where({ userId, collectionId }).select('id').first()
    return !!result
  }

  static async forPost(userId: number | undefined, postId: number) {
    if (!userId) return false
    const result = await this.query().where({ userId, postId }).select('id').first()
    return !!result
  }
}
