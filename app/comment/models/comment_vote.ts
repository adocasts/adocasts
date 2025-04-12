import Comment from '#comment/models/comment'
import { BaseModel, belongsTo, column } from '@adonisjs/lucid/orm'
import type { BelongsTo } from '@adonisjs/lucid/types/relations'
import { compose } from '@adonisjs/core/helpers'
import { DateTime } from 'luxon'
import { Voteable } from '#core/models/mixins/voteable'

export default class CommentVote extends compose(BaseModel, Voteable) {
  @column()
  declare commentId: number

  @column.dateTime({ autoCreate: true })
  declare createdAt: DateTime

  @column.dateTime({ autoCreate: true, autoUpdate: true })
  declare updatedAt: DateTime

  @belongsTo(() => Comment)
  declare comment: BelongsTo<typeof Comment>
}
