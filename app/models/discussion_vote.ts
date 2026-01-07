import { DiscussionVoteSchema } from '#database/schema'
import Discussion from '#models/discussion'
import { Voteable } from '#models/mixins/voteable'
import { compose } from '@adonisjs/core/helpers'
import { belongsTo } from '@adonisjs/lucid/orm'
import type { BelongsTo } from '@adonisjs/lucid/types/relations'

export default class DiscussionVote extends compose(DiscussionVoteSchema, Voteable) {
  @belongsTo(() => Discussion)
  declare discussion: BelongsTo<typeof Discussion>
}
