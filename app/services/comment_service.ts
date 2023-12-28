import db from "@adonisjs/lucid/services/db";
import States from "#enums/states";
import UnauthorizedException from "#exceptions/unauthorized_exception";
import Comment from "#models/comment";
import NotificationService from "./notification_service.js";
import sanitizeHtml from 'sanitize-html'
import IdentityService from "./identity_service.js";
import { DateTime } from "luxon";
import { HttpContext } from "@adonisjs/core/http";
import { inject } from "@adonisjs/core";
import { commentValidator } from '#validators/comment_validator'
import { Infer } from '@vinejs/vine/types';
import logger from "./logger_service.js";
import UtilityService from "./utility_service.js";

@inject()
export default class CommentService {
  constructor(protected ctx: HttpContext) {}

  public get user() {
    return this.ctx.auth.user
  }

  public async store(data: Infer<typeof commentValidator>) {
    if (!this.user) throw new UnauthorizedException('You must be signed in to create comments.')

    const trx = await db.transaction()
    const comment = new Comment()
    const identity = await IdentityService.getRequestIdentity(this.ctx.request)

    comment.useTransaction(trx)

    comment.merge({
      ...data,
      commentTypeId: Comment.getTypeId(data),
      identity,
      body: sanitizeHtml(data.body, { allowedAttributes: false }),
      userId: this.user.id,
      stateId: States.PUBLIC
    })

    if (!comment.rootParentId) {
      comment.rootParentId = comment.id
    }

    await comment.save()

    comment.replyTo
      ? await NotificationService.onCommentReply(comment, this.user, trx)
      : await NotificationService.onCommentCreate(comment, this.user, trx)

    await trx.commit()

    await logger.info('NEW COMMENT', {
      postId: comment.postId,
      body: UtilityService.truncate(comment.body, 100),
      go: NotificationService.getGoPath(comment)
    })

    return comment
  }

  /**
   * updates a comments body content
   * @param comment 
   * @param data 
   */
  public async update(comment: Comment, body: string) {
    const trx = await db.transaction()

    comment.useTransaction(trx)

    body = sanitizeHtml(body, { allowedAttributes: false })

    await comment.merge({ body }).save()
    await NotificationService.onUpdate(Comment.table, comment.id, comment.body, trx)
    await trx.commit()

    return comment
  }

  /**
   * toggles the authenticated user's like status for the given comment id
   * @param auth 
   * @param id 
   * @returns 
   */
  public async likeToggle(id: number | string) {
    if (!this.user) throw new UnauthorizedException('You must be signed in to like comments.')

    const user = this.user
    const vote = await user.related('commentVotes').query().where('comments.id', id).first()

    return vote 
      ? user.related('commentVotes').detach([id])
      : user.related('commentVotes').attach({
        [id]: {
          created_at: DateTime.now().toSQL(),
          updated_at: DateTime.now().toSQL()
        }
      })
  }

  /**
   * gracefully deletes or archives a comment based on whether it has children
   * @param comment 
   */
  public async destroy(comment: Comment) {
    const trx = await db.transaction()
    
    const parent = await comment.related('parent').query().first()
    const childCount = await comment.related('responses').query().whereNot('stateId', States.ARCHIVED).count('*', 'total').first()

    comment.useTransaction(trx)
    parent?.useTransaction(trx)
    
    if (parseInt(childCount?.$extras.total)) {
      comment.merge({ body: '[deleted]', userId: null, stateId: States.ARCHIVED })
      await comment.save()
    } else {
      await comment.related('userVotes').query().delete()
      await comment.delete()
      await NotificationService.onDelete(Comment.table, comment.id, trx)
    }

    if (parent?.stateId === States.ARCHIVED) {
      const siblingCount = await parent.related('responses').query().count('*', 'total').first()

      if (!parseInt(siblingCount?.$extras.total)) {
        await parent.delete()
        await NotificationService.onDelete(Comment.table, parent.id, trx)
      }
    }

    await trx.commit()
  }
}