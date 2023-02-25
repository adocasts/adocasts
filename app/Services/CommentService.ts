import { AuthContract } from "@ioc:Adonis/Addons/Auth";
import { RequestContract } from "@ioc:Adonis/Core/Request";
import Database from "@ioc:Adonis/Lucid/Database";
import States from "App/Enums/States";
import UnauthorizedException from "App/Exceptions/UnauthorizedException";
import Comment from 'App/Models/Comment'
import CommentValidator from "App/Validators/CommentValidator";
import NotificationService from "./NotificationService";
import sanitizeHtml from 'sanitize-html'
import Logger from "@ioc:Logger/Discord";
import UtilityService from "./UtilityService";
import IdentityService from "./IdentityService";

export default class CommentService {
  public static async store(request: RequestContract, auth: AuthContract, { body, ...data }: CommentValidator['schema']['props']) {
    if (!auth.user) throw new UnauthorizedException('You must be signed in to create comments.')

    const trx = await Database.transaction()
    const comment = new Comment()
    const identity = await IdentityService.getRequestIdentity(request)

    comment.useTransaction(trx)

    comment.merge({
      ...data,
      identity,
      body: sanitizeHtml(body),
      userId: auth.user.id,
      stateId: States.PUBLIC
    })

    if (!comment.rootParentId) {
      comment.rootParentId = comment.id
    }

    await comment.save()

    comment.replyTo
      ? await NotificationService.onCommentReply(comment, auth.user, trx)
      : await NotificationService.onCommentCreate(comment, auth.user, trx)

    await trx.commit()

    await Logger.info('NEW COMMENT', {
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
  public static async update(comment: Comment, data: { [key: string]: any }) {
    const trx = await Database.transaction()

    comment.useTransaction(trx)

    await comment.merge(data).save()
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
  public static async likeToggle(auth: AuthContract, id: number | string) {
    if (!auth.user) throw new UnauthorizedException('You must be signed in to like comments.')

    const user = auth.user
    const vote = await user.related('commentVotes').query().where('comments.id', id).first()

    return vote 
      ? user.related('commentVotes').detach([id])
      : user.related('commentVotes').attach([id])
  }

  /**
   * gracefully deletes or archives a comment based on whether it has children
   * @param comment 
   */
  public static async destroy(comment: Comment) {
    const trx = await Database.transaction()
    
    const parent = await comment.related('parent').query().first()
    const childCount = await comment.related('responses').query().whereNot('stateId', States.ARCHIVED).getCount()

    comment.useTransaction(trx)
    parent?.useTransaction(trx)

    if (childCount) {
      comment.merge({ body: '[deleted]', userId: null, stateId: States.ARCHIVED })
      await comment.save()
    } else {
      await comment.related('userVotes').query().delete()
      await comment.delete()
      await NotificationService.onDelete(Comment.table, comment.id, trx)
    }

    if (parent?.stateId === States.ARCHIVED) {
      const siblingCount = await parent.related('responses').query().getCount()

      if (!siblingCount) {
        await parent.delete()
        await NotificationService.onDelete(Comment.table, parent.id, trx)
      }
    }

    await trx.commit()
  }
}