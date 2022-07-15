import { DateTime } from 'luxon'
import { BelongsTo, belongsTo, column, computed, HasMany, hasMany, ManyToMany, manyToMany } from '@ioc:Adonis/Lucid/Orm'
import User from './User'
import Post from './Post'
import State from 'App/Enums/States'
import AppBaseModel from 'App/Models/AppBaseModel'
import * as timeago from 'timeago.js'

export default class Comment extends AppBaseModel {
  @column({ isPrimary: true })
  public id: number

  @column()
  public userId: number | null

  @column()
  public postId: number

  @column()
  public replyTo: number | null

  @column()
  public rootParentId: number

  @column()
  public stateId: number

  @column()
  public levelIndex: number

  @column()
  public name: string

  @column()
  public body: string

  @column({ serializeAs: null })
  public identity: string

  @column.dateTime({ autoCreate: true })
  public createdAt: DateTime

  @column.dateTime({ autoCreate: true, autoUpdate: true })
  public updatedAt: DateTime

  @computed()
  public get isPublic() {
    return this.stateId === State.PUBLIC
  }

  @belongsTo(() => User)
  public user: BelongsTo<typeof User>

  @belongsTo(() => Post)
  public post: BelongsTo<typeof Post>

  @hasMany(() => Comment, { foreignKey: 'replyTo' })
  public responses: HasMany<typeof Comment>

  @belongsTo(() => Comment, { foreignKey: 'replyTo' })
  public parent: BelongsTo<typeof Comment>

  @manyToMany(() => User, {
    pivotTable: 'comment_votes'
  })
  public userVotes: ManyToMany<typeof User>

  @computed()
  public get createdAtCalendar() {
    return this.createdAt.toRelativeCalendar();
  }

  @computed()
  public get timeago() {
    return timeago.format(this.createdAt.toJSDate())
  }
}
