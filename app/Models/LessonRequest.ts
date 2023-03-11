import { DateTime } from 'luxon'
import { BaseModel, BelongsTo, belongsTo, column, computed, HasMany, hasMany, ManyToMany, manyToMany } from '@ioc:Adonis/Lucid/Orm'
import User from './User'
import RequestPriorities from 'App/Enums/RequestPriorities'
import States, { StateDesc } from 'App/Enums/States'
import Comment from './Comment'

export default class LessonRequest extends BaseModel {
  @column({ isPrimary: true })
  public id: number

  @column()
  public userId: number

  @column()
  public stateId: number

  @column()
  public approveCommentId: number | null

  @column()
  public rejectCommentId: number | null

  @column()
  public completeCommentId: number | null

  @column()
  public name: string

  @column()
  public body: string

  @column()
  public priority: number = RequestPriorities.NORMAL

  @column.dateTime({ autoCreate: true })
  public createdAt: DateTime

  @column.dateTime({ autoCreate: true, autoUpdate: true })
  public updatedAt: DateTime

  @belongsTo(() => User)
  public user: BelongsTo<typeof User>

  @belongsTo(() => Comment)
  public approveComment: BelongsTo<typeof Comment>

  @belongsTo(() => Comment)
  public rejectComment: BelongsTo<typeof Comment>

  @belongsTo(() => Comment)
  public completeComment: BelongsTo<typeof Comment>

  @hasMany(() => Comment)
  public comments: HasMany<typeof Comment>

  @manyToMany(() => User, {
    pivotTable: 'request_votes',
  })
  public votes: ManyToMany<typeof User>

  @computed()
  public get state() {
    if (this.stateId === States.PUBLIC) {
      return "Completed"
    }
    
    return StateDesc[this.stateId]
  }
}
