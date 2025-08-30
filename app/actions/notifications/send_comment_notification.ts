import BaseAction from '#actions/base_action'
import CommentTypes from '#enums/comment_types'
import NotificationTypes from '#enums/notification_types'
import Comment from '#models/comment'
import Discussion from '#models/discussion'
import LessonRequest from '#models/lesson_request'
import Post from '#models/post'
import User from '#models/user'
import logger from '#services/logger_service'
import { TransactionClientContract } from '@adonisjs/lucid/types/database'
import SendNotification from './send_notification.js'

interface CommentNotificationInterface {
  comment: Comment
  notifyUserId: number
  initiatingUserId: number
  title: string
  trx?: TransactionClientContract
}

export default class SendCommentNotification extends BaseAction {
  async handle(comment: Comment, user: User, trx?: TransactionClientContract) {
    return this.#manage(comment, async () => {
      if (comment.replyTo) {
        return this.#handleForReply(comment, user, trx)
      }

      switch (comment.commentTypeId) {
        case CommentTypes.POST:
          return this.#handleForPost(comment, user, trx)
        case CommentTypes.DISCUSSION:
          return this.#handleForDiscussion(comment, user, trx)
        case CommentTypes.LESSON_REQUEST:
          return this.#handleForLessonRequest(comment, user, trx)
      }
    })
  }

  async #handleForReply(comment: Comment, user: User, trx?: TransactionClientContract) {
    const parent = await Comment.findOrFail(comment.replyTo)

    if (!parent.userId) return []

    return this.#createNotification({
      trx,
      comment,
      notifyUserId: parent.userId,
      initiatingUserId: user.id,
      title: `${user.handle} replied to your comment`,
    })
  }

  async #handleForPost(comment: Comment, user: User, trx?: TransactionClientContract) {
    const post = await Post.findOrFail(comment.postId)
    const notifiedUserIds: number[] = []

    await post.load('authors')

    for (const author of post.authors) {
      const userIds = await this.#createNotification({
        trx,
        comment,
        notifyUserId: author.id,
        initiatingUserId: user.id,
        title: `${user.handle} commented on your post`,
      })

      notifiedUserIds.push(...userIds)
    }

    return notifiedUserIds
  }

  async #handleForDiscussion(comment: Comment, user: User, trx?: TransactionClientContract) {
    const discussion = await Discussion.findOrFail(comment.discussionId)

    return this.#createNotification({
      trx,
      comment,
      notifyUserId: discussion.userId,
      initiatingUserId: user.id,
      title: `${user.handle} replied to your discussion`,
    })
  }

  async #handleForLessonRequest(comment: Comment, user: User, trx?: TransactionClientContract) {
    const request = await LessonRequest.findOrFail(comment.lessonRequestId)

    return this.#createNotification({
      trx,
      comment,
      notifyUserId: request.userId,
      initiatingUserId: user.id,
      title: `${user.handle} commented on your lesson request`,
    })
  }

  async #createNotification({
    comment,
    notifyUserId,
    initiatingUserId,
    title,
    trx,
  }: CommentNotificationInterface) {
    return SendNotification.run({
      trx,
      title,
      model: Comment,
      record: comment,
      notifyUserId: notifyUserId,
      initiatingUserId: initiatingUserId,
      href: comment.goPath,
      notificationTypeId: comment.replyTo
        ? NotificationTypes.COMMENT_REPLY
        : NotificationTypes.COMMENT,
    })
  }

  async #manage(comment: Comment, callback: () => Promise<number[]>) {
    try {
      return callback()
    } catch (error) {
      await logger.error('Failed to create comment notification', {
        comment: comment.serialize(),
        error,
      })

      throw error
    }
  }
}
