import LessonRequestBuilder from '#builders/lesson_request_builder'
import { LessonRequestSchema } from '#database/schema'
import States, { StateDesc } from '#enums/states'
import Comment from '#models/comment'
import User from '#models/user'
import { belongsTo, computed, hasMany, manyToMany } from '@adonisjs/lucid/orm'
import type { BelongsTo, HasMany, ManyToMany } from '@adonisjs/lucid/types/relations'

export default class LessonRequest extends LessonRequestSchema {
  static build = () => new LessonRequestBuilder()

  @belongsTo(() => User)
  declare user: BelongsTo<typeof User>

  @belongsTo(() => Comment)
  declare approveComment: BelongsTo<typeof Comment>

  @belongsTo(() => Comment)
  declare rejectComment: BelongsTo<typeof Comment>

  @belongsTo(() => Comment)
  declare completeComment: BelongsTo<typeof Comment>

  @hasMany(() => Comment)
  declare comments: HasMany<typeof Comment>

  @manyToMany(() => User, {
    pivotTable: 'request_votes',
  })
  declare votes: ManyToMany<typeof User>

  @computed()
  get state() {
    if (this.stateId === States.PUBLIC) {
      return 'Completed'
    }

    return StateDesc[this.stateId]
  }

  @computed()
  get routeUrl() {
    return `/requests/${this.id}`
  }
}
