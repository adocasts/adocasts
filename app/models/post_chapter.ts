import { PostChapterSchema } from '#database/schema'
import Post from '#models/post'
import { belongsTo, computed } from '@adonisjs/lucid/orm'
import type { BelongsTo } from '@adonisjs/lucid/types/relations'

export default class PostChapter extends PostChapterSchema {
  @belongsTo(() => Post)
  declare post: BelongsTo<typeof Post>

  @computed()
  get startSeconds() {
    const parts = this.start.split(':')
    const hours = parts.length > 2 ? Number(parts[0]) : 0
    const minutes = parts.length > 2 ? Number(parts[1]) : Number(parts[0])
    const seconds = parts.length > 2 ? Number(parts[2]) : Number(parts[1])
    return hours * 3600 + minutes * 60 + seconds
  }

  @computed()
  get endSeconds() {
    const parts = this.end.split(':')
    const hours = parts.length > 2 ? Number(parts[0]) : 0
    const minutes = parts.length > 2 ? Number(parts[1]) : Number(parts[0])
    const seconds = parts.length > 2 ? Number(parts[2]) : Number(parts[1])
    return hours * 3600 + minutes * 60 + seconds
  }
}
