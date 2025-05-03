import Comment from '#comment/models/comment'
import BaseAction from '#core/actions/base_action'
import logger from '#core/services/logger_service'
import NotificationTypes from '#notification/enums/notification_types'
import Notification from '#notification/models/notification'
import User from '#user/models/user'
import string from '@adonisjs/core/helpers/string'
import { TransactionClientContract } from '@adonisjs/lucid/types/database'

export default class SendCommentReplyNotification extends BaseAction<
  [Comment, User, TransactionClientContract | undefined]
> {
  async handle(comment: Comment, user: User, trx?: TransactionClientContract) {
    try {
      const parent = await Comment.findOrFail(comment.replyTo)
      const userId = parent.userId

      // if replying to anon or self, ignore
      if (!userId || userId === user.id) return

      const notification = await Notification.create(
        {
          userId,
          initiatorUserId: user.id,
          notificationTypeId: NotificationTypes.COMMENT_REPLY,
          table: Comment.table,
          tableId: comment.id,
          title: `${user.handle} replied to your comment`,
          body: string.excerpt(comment.body, 255, { completeWords: true }),
          href: comment.goPath,
        },
        { client: trx }
      )

      await notification.trySendEmail(userId, trx)

      return [userId]
    } catch (error) {
      await logger.error('Failed to create comment reply notification', {
        comment: comment.serialize(),
        error,
      })

      throw error
    }
  }
}
