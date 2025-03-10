import { DateTime } from 'luxon'
import { BaseModel, beforeSave, belongsTo, column } from '@adonisjs/lucid/orm'
import Post from './post.js'
import type { BelongsTo } from '@adonisjs/lucid/types/relations'
import CaptionTypes from '#enums/caption_types'
import CaptionLanguages, { CaptionLanguageDesc } from '#enums/caption_languages'

export default class PostCaption extends BaseModel {
  @column({ isPrimary: true })
  declare id: number

  @column()
  declare postId: number

  @column()
  declare type: CaptionTypes

  @column()
  declare label: string

  @column()
  declare language: CaptionLanguages

  @column()
  declare filename: string

  @column()
  declare sortOrder: number

  @column.dateTime({ autoCreate: true })
  declare createdAt: DateTime

  @column.dateTime({ autoCreate: true, autoUpdate: true })
  declare updatedAt: DateTime

  @belongsTo(() => Post)
  declare post: BelongsTo<typeof Post>

  @beforeSave()
  public static async setDefaults(row: PostCaption) {
    if (!row.filename) {
      row.filename = `${row.language}.${row.type}`
    }

    if (!row.label) {
      row.label = CaptionLanguageDesc[row.language]
    }
  }
}
