import { CommentVoteSchema } from '#database/schema'
import Comment from '#models/comment'
import { Voteable } from '#models/mixins/voteable'
import { compose } from '@adonisjs/core/helpers'
import { belongsTo } from '@adonisjs/lucid/orm'
import type { BelongsTo } from '@adonisjs/lucid/types/relations'

export default class CommentVote extends compose(CommentVoteSchema, Voteable) {
  @belongsTo(() => Comment)
  declare comment: BelongsTo<typeof Comment>
}
