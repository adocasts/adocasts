import { PostCaptionSchema } from '#database/schema'
import { CaptionLanguageDesc } from '#enums/caption_languages'
import Post from '#models/post'
import { beforeSave, belongsTo } from '@adonisjs/lucid/orm'
import type { BelongsTo } from '@adonisjs/lucid/types/relations'

export default class PostCaption extends PostCaptionSchema {
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
