import Collection from '#models/collection'
import Post from '#models/post'
import ProgressBuilder from '#builders/progress_builder'
import User from '#models/user'
import { BaseModel, belongsTo, column, computed } from '@adonisjs/lucid/orm'
import type { BelongsTo } from '@adonisjs/lucid/types/relations'
import { DateTime } from 'luxon'

export default class Progress extends BaseModel {
  static build = (user?: User) => ProgressBuilder.new(user)

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
