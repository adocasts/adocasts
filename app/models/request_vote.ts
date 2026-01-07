import { RequestVoteSchema } from '#database/schema'
import LessonRequest from '#models/lesson_request'
import User from '#models/user'
import { belongsTo } from '@adonisjs/lucid/orm'
import type { BelongsTo } from '@adonisjs/lucid/types/relations'

export default class RequestVote extends RequestVoteSchema {
  @belongsTo(() => User)
  declare user: BelongsTo<typeof User>

  @belongsTo(() => LessonRequest)
  declare lessonRequest: BelongsTo<typeof LessonRequest>
}
