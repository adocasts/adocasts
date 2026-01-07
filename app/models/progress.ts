import ProgressBuilder from '#builders/progress_builder'
import { ProgressSchema } from '#database/schema'
import Collection from '#models/collection'
import Post from '#models/post'
import User from '#models/user'
import { belongsTo, computed } from '@adonisjs/lucid/orm'
import type { BelongsTo } from '@adonisjs/lucid/types/relations'

export default class Progress extends ProgressSchema {
  static build = (user?: User) => ProgressBuilder.new(user)
  static completedPercentThreshold = 90

  @belongsTo(() => Post)
  declare post: BelongsTo<typeof Post>

  @belongsTo(() => Collection)
  declare collection: BelongsTo<typeof Collection>

  @computed()
  get hasActivity() {
    return (this.readPercent && this.readPercent > 0) || this.watchSeconds > 0
  }
}
