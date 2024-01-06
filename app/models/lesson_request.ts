import { DateTime } from 'luxon'
import { BaseModel, belongsTo, column, computed, hasMany, manyToMany } from '@adonisjs/lucid/orm'
import type { BelongsTo, HasMany, ManyToMany } from '@adonisjs/lucid/types/relations'
import User from '#models/user'
import Comment from '#models/comment'
import RequestPriorities from '#enums/request_priorities'
import States, { StateDesc } from '#enums/states'

export default class LessonRequest extends BaseModel {
  @column({ isPrimary: true })
  declare id: number

  @column()
  declare userId: number

  @column()
  declare stateId: States

  @column()
  declare approveCommentId: number | null

  @column()
  declare rejectCommentId: number | null

  @column()
  declare completeCommentId: number | null

  @column()
  declare name: string

  @column()
  declare body: string
  bodyDisplay: string = ''

  @column()
  priority: number = RequestPriorities.NORMAL

  @column.dateTime({ autoCreate: true })
  declare createdAt: DateTime

  @column.dateTime({ autoCreate: true, autoUpdate: true })
  declare updatedAt: DateTime

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
}
