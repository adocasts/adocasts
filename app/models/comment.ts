import { CommentSchema } from '#database/schema'
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
  beforeCreate,
  beforeSave,
  belongsTo,
  computed,
  hasMany,
  manyToMany,
} from '@adonisjs/lucid/orm'
import type { BelongsTo, HasMany, ManyToMany } from '@adonisjs/lucid/types/relations'
import { Infer } from '@vinejs/vine/types'

export default class Comment extends CommentSchema {
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
