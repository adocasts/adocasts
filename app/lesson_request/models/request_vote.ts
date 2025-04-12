import { DateTime } from 'luxon'
import { BaseModel, belongsTo, column } from '@adonisjs/lucid/orm'
import type { BelongsTo } from '@adonisjs/lucid/types/relations'
import { compose } from '@adonisjs/core/helpers'
import LessonRequest from '#lesson_request/models/lesson_request'
import { Voteable } from '#core/models/mixins/voteable'

export default class RequestVote extends compose(BaseModel, Voteable) {
  @column()
  declare lessonRequestId: number | null

  @column.dateTime({ autoCreate: true })
  declare createdAt: DateTime

  @column.dateTime({ autoCreate: true, autoUpdate: true })
  declare updatedAt: DateTime

  @belongsTo(() => LessonRequest)
  declare lessonRequest: BelongsTo<typeof LessonRequest>
}
