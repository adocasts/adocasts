import { DateTime } from 'luxon'
import { BaseModel, belongsTo, column, computed } from '@adonisjs/lucid/orm'
import Post from './post.js'
import type { BelongsTo } from '@adonisjs/lucid/types/relations'

export default class PostChapter extends BaseModel {
  @column({ isPrimary: true })
  declare id: number

  @column()
  declare postId: number

  @column()
  declare start: string

  @column()
  declare end: string

  @column()
  declare text: string

  @column()
  declare sortOrder: number

  @column.dateTime({ autoCreate: true })
  declare createdAt: DateTime

  @column.dateTime({ autoCreate: true, autoUpdate: true })
  declare updatedAt: DateTime

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
