import { DateTime } from 'luxon'
import { belongsTo, column, computed, hasMany, manyToMany } from '@adonisjs/lucid/orm'
import type { BelongsTo, HasMany, ManyToMany } from '@adonisjs/lucid/types/relations'
import User from '#models/user'
import Post from '#models/post'
import LessonRequest from '#models/lesson_request'
import State from '#enums/states'
import AppBaseModel from '#models/app_base_model'
import CommentTypes from '#enums/comment_types'
import UtilityService from '#services/utility_service'
import Discussion from './discussion.js'
import { Infer } from '@vinejs/vine/types'
import { commentValidator } from '#validators/comment_validator'

export default class Comment extends AppBaseModel {
  @column({ isPrimary: true })
  declare id: number

  @column()
  declare userId: number | null

  @column()
  declare postId: number | null

  @column()
  declare lessonRequestId: number | null

  @column()
  declare discussionId: number | null

  @column()
  declare replyTo: number | null

  @column()
  declare rootParentId: number

  @column()
  declare commentTypeId: CommentTypes

  @column()
  declare stateId: number

  @column()
  declare levelIndex: number

  @column()
  declare name: string

  @column()
  declare body: string
  bodyDisplay: string = ''

  @column({ serializeAs: null })
  declare identity: string

  @column.dateTime({ autoCreate: true })
  declare createdAt: DateTime

  @column.dateTime({ autoCreate: true, autoUpdate: true })
  declare updatedAt: DateTime

  @computed()
  get isPublic() {
    return this.stateId === State.PUBLIC
  }

  @belongsTo(() => User)
  declare user: BelongsTo<typeof User>

  @belongsTo(() => Post)
  declare post: BelongsTo<typeof Post>

  @belongsTo(() => LessonRequest)
  declare lessonRequest: BelongsTo<typeof LessonRequest>

  @belongsTo(() => Discussion)
  declare discussion: BelongsTo<typeof Discussion>

  @hasMany(() => Comment, { foreignKey: 'replyTo' })
  declare responses: HasMany<typeof Comment>

  @belongsTo(() => Comment, { foreignKey: 'replyTo' })
  declare parent: BelongsTo<typeof Comment>

  @manyToMany(() => User, {
    pivotTable: 'comment_votes',
  })
  declare userVotes: ManyToMany<typeof User>

  get createdAtCalendar() {
    return this.createdAt?.toRelativeCalendar()
  }

  get timeago() {
    return UtilityService.timeago(this.createdAt)
  }

  static getTypeId(comment: Comment | Infer<typeof commentValidator>) {
    if (comment.lessonRequestId) return CommentTypes.LESSON_REQUEST
    if (comment.discussionId) return CommentTypes.DISCUSSION
    return CommentTypes.POST
  }
}
