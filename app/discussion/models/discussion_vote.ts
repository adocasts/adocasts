import { DateTime } from 'luxon'
import { BaseModel, belongsTo, column } from '@adonisjs/lucid/orm'
import type { BelongsTo } from '@adonisjs/lucid/types/relations'
import Discussion from '#discussion/models/discussion'
import { compose } from '@adonisjs/core/helpers'
import { Voteable } from '#core/models/mixins/voteable'

export default class DiscussionVote extends compose(BaseModel, Voteable) {
  @column()
  declare discussionId: number | null

  @column.dateTime({ autoCreate: true })
  declare createdAt: DateTime

  @column.dateTime({ autoCreate: true, autoUpdate: true })
  declare updatedAt: DateTime

  @belongsTo(() => Discussion)
  declare discussion: BelongsTo<typeof Discussion>
}
