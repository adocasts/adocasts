import { DateTime } from 'luxon'
import { BaseModel, BelongsTo, belongsTo, column, computed } from '@ioc:Adonis/Lucid/Orm'
import User from './User'
import RequestPriorities from 'App/Enums/RequestPriorities'
import { StateDesc } from 'App/Enums/States'

export default class LessonRequest extends BaseModel {
  @column({ isPrimary: true })
  public id: number

  @column()
  public userId: number

  @column()
  public stateId: number

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

  @computed()
  public get state() {
    return StateDesc[this.stateId]
  }
}
