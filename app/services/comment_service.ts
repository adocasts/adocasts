import db from '@adonisjs/lucid/services/db'
import States from '#enums/states'
import UnauthorizedException from '#exceptions/unauthorized_exception'
import Comment from '#models/comment'
import NotificationService from './notification_service.js'
import IdentityService from './identity_service.js'
import { DateTime } from 'luxon'
import { HttpContext } from '@adonisjs/core/http'
import { inject } from '@adonisjs/core'
import { commentValidator } from '#validators/comment_validator'
import { Infer } from '@vinejs/vine/types'
import logger from './logger_service.js'
import UtilityService from './utility_service.js'
import MentionService from './mention_service.js'
import SanitizeService from './sanitize_service.js'

@inject()
export default class CommentService {
  constructor(protected ctx: HttpContext) {}

  get user() {
    return this.ctx.auth.user
  }

  async store(data: Infer<typeof commentValidator>) {
    if (!this.user) throw new UnauthorizedException('You must be signed in to create comments.')

    const comment = new Comment()

    await db.transaction(async (trx) => {
      const identity = await IdentityService.getRequestIdentity(this.ctx.request)

      comment.useTransaction(trx)

      comment.merge({
        ...data,
        commentTypeId: Comment.getTypeId(data),
        identity,
        body: SanitizeService.sanitize(data.body),
        userId: this.user!.id,
        stateId: States.PUBLIC,
      })

      if (!comment.rootParentId) {
        comment.rootParentId = comment.id
      }

      await comment.save()

      const notifiedUserId = comment.replyTo
        ? await NotificationService.onCommentReply(comment, this.user, trx)
        : await NotificationService.onCommentCreate(comment, this.user, trx)

      await MentionService.checkForCommentMention(comment, this.user!, [notifiedUserId], trx)
    })

    await logger.info('NEW COMMENT', {
      postId: comment.postId,
      body: UtilityService.truncate(comment.body, 100),
      go: NotificationService.getGoPath(comment),
    })

    return comment
  }

  /**
   * updates a comments body content
   * @param comment
   * @param data
   */
  async update(comment: Comment, body: string) {
    await db.transaction(async (trx) => {
      const oldBody = comment.body

      comment.useTransaction(trx)

      body = SanitizeService.sanitize(body)

      await comment.merge({ body }).save()
      await NotificationService.onUpdate(Comment.table, comment.id, comment.body, trx)

      const newMentions = MentionService.checkTextForNewMentions(oldBody, body)

      if (newMentions.length) {
        await NotificationService.onCommentMention(comment, newMentions, this.user!, trx)
      }
    })

    return comment
  }

  /**
   * toggles the authenticated user's like status for the given comment id
   * @param auth
   * @param id
   * @returns
   */
  async likeToggle(id: number | string) {
    if (!this.user) throw new UnauthorizedException('You must be signed in to like comments.')

    const user = this.user
    const vote = await user.related('commentVotes').query().where('comments.id', id).first()

    return vote
      ? user.related('commentVotes').detach([id])
      : user.related('commentVotes').attach({
          [id]: {
            created_at: DateTime.now().toSQL(),
            updated_at: DateTime.now().toSQL(),
          },
        })
  }

  /**
   * gracefully deletes or archives a comment based on whether it has children
   * @param comment
   */
  async destroy(comment: Comment) {
    await db.transaction(async (trx) => {
      const parent = await comment.related('parent').query().first()
      const childCount = await comment
        .related('responses')
        .query()
        .whereNot('stateId', States.ARCHIVED)
        .count('*', 'total')
        .first()

      comment.useTransaction(trx)
      parent?.useTransaction(trx)

      if (Number.parseInt(childCount?.$extras.total)) {
        comment.merge({ body: '[deleted]', userId: null, stateId: States.ARCHIVED })
        await comment.save()
      } else {
        await comment.related('userVotes').query().delete()
        await comment.delete()
        await NotificationService.onDelete(Comment.table, comment.id, trx)
      }

      if (parent?.stateId === States.ARCHIVED) {
        const siblingCount = await parent.related('responses').query().count('*', 'total').first()

        if (!Number.parseInt(siblingCount?.$extras.total)) {
          await parent.delete()
          await NotificationService.onDelete(Comment.table, parent.id, trx)
        }
      }
    })
  }
}
