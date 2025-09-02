import CommentTypes from '#enums/comment_types'
import { default as State, default as States } from '#enums/states'
import Discussion from '#models/discussion'
import LessonRequest from '#models/lesson_request'
import Post from '#models/post'
import User from '#models/user'
import SanitizeService from '#services/sanitize_service'
import TimeService from '#services/time_service'
import { commentStoreValidator } from '#validators/comment'
import {
  BaseModel,
  beforeCreate,
  beforeSave,
  belongsTo,
  column,
  computed,
  hasMany,
  manyToMany,
} from '@adonisjs/lucid/orm'
import type { BelongsTo, HasMany, ManyToMany } from '@adonisjs/lucid/types/relations'
import { Infer } from '@vinejs/vine/types'
import { DateTime } from 'luxon'

export default class Comment extends BaseModel {
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
  declare identity: string | null

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

  @hasMany(() => Discussion, {
    foreignKey: 'solvedCommentId',
  })
  declare discussionSolves: HasMany<typeof Discussion>

  @manyToMany(() => User, {
    pivotTable: 'comment_votes',
  })
  declare userVotes: ManyToMany<typeof User>

  get createdAtCalendar() {
    return this.createdAt?.toRelativeCalendar()
  }

  get timeago() {
    return TimeService.timeago(this.createdAt)
  }

  get goPath() {
    if (this.lessonRequestId) {
      return `/go/requests/lessons/${this.lessonRequestId}/comment/${this.id}`
    }

    if (this.discussionId) {
      return `/go/discussions/${this.discussionId}/comment/${this.id}`
    }

    return `/go/posts/${this.postId}/comment/${this.id}`
  }

  get commentableId() {
    switch (this.commentTypeId) {
      case CommentTypes.POST:
        return this.postId
      case CommentTypes.DISCUSSION:
        return this.discussionId
      case CommentTypes.LESSON_REQUEST:
        return this.lessonRequestId
    }
  }

  async getCommentable() {
    switch (this.commentTypeId) {
      case CommentTypes.POST:
        return Post.find(this.postId)
      case CommentTypes.DISCUSSION:
        return Discussion.find(this.discussionId)
      case CommentTypes.LESSON_REQUEST:
        return LessonRequest.find(this.lessonRequestId)
    }
  }

  async archive() {
    if (this.stateId === States.ARCHIVED) return

    this.stateId = States.ARCHIVED
    this.userId = null
    this.body = '[deleted]'

    await this.save()
  }

  @beforeCreate()
  static async fillDefaults(comment: Comment) {
    if (!comment.rootParentId) {
      comment.rootParentId = comment.id
    }

    comment.commentTypeId = this.getTypeId(comment)
    comment.stateId = States.PUBLIC
  }

  @beforeSave()
  static async sanitize(comment: Comment) {
    comment.body = SanitizeService.sanitize(comment.body)
  }

  static getTypeId(comment: Comment | Infer<typeof commentStoreValidator>) {
    if (comment.lessonRequestId) return CommentTypes.LESSON_REQUEST
    if (comment.discussionId) return CommentTypes.DISCUSSION
    return CommentTypes.POST
  }
}
