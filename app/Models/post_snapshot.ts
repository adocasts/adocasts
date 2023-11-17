import { DateTime } from 'luxon'
import { belongsTo, column } from '@adonisjs/lucid/orm'
import type { BelongsTo } from '@adonisjs/lucid/types/relations'
import Post from '#models/post'
import AppBaseModel from '#models/app_base_model'

export default class PostSnapshot extends AppBaseModel {
  @column({ isPrimary: true })
  declare id: number

  @column()
  declare postId: number

  @column()
  declare revision: number

  @column.dateTime()
  declare revisionDate: DateTime

  @column()
  declare revisedBy: number

  @column()
  declare title: string

  @column()
  declare slug: string

  @column()
  declare pageTitle: string | null

  @column()
  declare description: string | null

  @column()
  declare metaDescription: string | null

  @column()
  declare canonical: string | null

  @column()
  declare body: string | null

  @column()
  declare videoUrl: string | null

  @column()
  declare isFeatured: boolean | null

  @column()
  declare isPersonal: boolean | null

  @column()
  declare viewCount: number | null

  @column()
  declare viewCountUnique: number | null

  @column()
  declare stateId: number | null

  @column()
  declare timezone: string | null

  @column()
  declare publishAtUser: string | null

  @column.dateTime()
  declare publishAt: DateTime | null

  @column.dateTime()
  declare deletedAt: DateTime | null

  @column.dateTime({ autoCreate: true })
  declare createdAt: DateTime

  @column.dateTime({ autoCreate: true, autoUpdate: true })
  declare updatedAt: DateTime

  @belongsTo(() => Post)
  declare post: BelongsTo<typeof Post>
}
