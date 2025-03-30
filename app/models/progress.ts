import { DateTime } from 'luxon'
import { BaseModel, belongsTo, column, computed } from '@adonisjs/lucid/orm'
import type { BelongsTo } from '@adonisjs/lucid/types/relations'
import Collection from './collection.js'
import Post from './post.js'
import ProgressBuilder from '#builders/progress_builder'

export default class Progress extends BaseModel {
  static build = () => ProgressBuilder.new()

  @column({ isPrimary: true })
  declare id: number

  @column()
  declare userId: number

  @column()
  declare postId: number | null

  @column()
  declare collectionId: number | null

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

  @computed()
  get hasActivity() {
    return (this.readPercent && this.readPercent > 0) || this.watchSeconds > 0
  }
}
