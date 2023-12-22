import { TransactionClientContract } from '@adonisjs/lucid/types/database'
import Notification from '#models/notification'
import User from '#models/user'
import UtilityService from './utility_service.js'
import Comment from '#models/comment'
import NotificationTypes from '#enums/notification_types'
// import Logger from "@ioc:Logger/Discord"
import Post from '#models/post'
import LessonRequest from '#models/lesson_request'
import NotImplementedException from '#exceptions/not_implemented_exception'
import { DateTime } from 'luxon'

export default class NotificationService {
  /**
   * Get notifications for a user (or stub for unauthenticated users)
   * @param user
   * @param stub
   * @returns
   */
  static async getForUser(user: User | undefined, stub: boolean = false) {
    if (!user || stub)
      return {
        unread: [],
        read: [],
      }

    return {
      unread: await this.getUnreadByUserId(user.id),
      read: await this.getReadByUserId(user.id),
    }
  }

  /**
   * Get unread notifications for a user
   * @param userId
   * @returns
   */
  static async getUnreadByUserId(userId: number) {
    return Notification.query().where({ userId }).whereNull('readAt').orderBy('createdAt', 'desc')
  }

  /**
   * Gets the number of unread notifications for the user
   * @param userId
   * @returns
   */
  static async getUnreadCount(userId: number | undefined) {
    if (!userId) return 0
    return Notification.query()
      .where({ userId })
      .whereNull('readAt')
      .count('* as total')
      .then((res) => res.at(0)?.$extras.total)
  }

  /**
   * Marks the provided unread notifications as read
   * @param unread
   */
  static async markAsRead(unread: Notification[] | Notification) {
    if (!Array.isArray(unread)) {
      unread = [unread]
    }

    await Notification.query()
      .whereIn(
        'id',
        unread.map((item) => item.id)
      )
      .update({ readAt: DateTime.now() })
  }

  /**
   * Get read notifications for a user
   * @param userId
   * @param limit
   * @returns
   */
  static async getReadByUserId(userId: number, limit: number = 25) {
    return Notification.query()
      .where({ userId })
      .whereNotNull('readAt')
      .orderBy('createdAt', 'desc')
      .limit(limit)
  }

  /**
   * updates an already existing notification body content
   * @param table
   * @param tableId
   * @param body
   * @param trx
   * @returns
   */
  static async onUpdate(
    table: string,
    tableId: number,
    body: string,
    trx: TransactionClientContract | null = null
  ) {
    const query = trx ? Notification.query({ client: trx }) : Notification.query()
    return query.where({ table, tableId }).update({ body: UtilityService.truncate(body) })
  }

  /**
   * deletes notification matching table and it's id
   * @param table
   * @param tableId
   * @param trx
   * @returns
   */
  static async onDelete(
    table: string,
    tableId: number,
    trx: TransactionClientContract | null = null
  ) {
    const query = trx ? Notification.query({ client: trx }) : Notification.query()
    return query.where({ table, tableId }).delete()
  }

  /**
   * creates comment notification
   * @param comment
   * @param user
   */
  static async onCommentCreate(
    comment: Comment,
    user?: User,
    trx: TransactionClientContract | null = null
  ) {
    if (comment.lessonRequestId) {
      return this.onLessonRequestCommentCreate(comment, user, trx)
    } else if (comment.postId) {
      return this.onPostCommentCreate(comment, user, trx)
    }

    throw new NotImplementedException('Unsupported comment type submitted')
  }

  /**
   * creates comment notification for a post
   * @param comment
   * @param user
   */
  static async onPostCommentCreate(
    comment: Comment,
    user?: User,
    trx: TransactionClientContract | null = null
  ) {
    try {
      const post = await Post.findOrFail(comment.postId)
      await post.load('authors')

      for (let i = 0; i < post.authors.length; i++) {
        const notification = new Notification()

        if (trx) {
          notification.useTransaction(trx)
        }

        notification.merge({
          userId: post.authors[i].id,
          initiatorUserId: user?.id,
          notificationTypeId: NotificationTypes.COMMENT,
          table: Comment.table,
          tableId: comment.id,
          title: user
            ? `${user.username} commented on your post`
            : 'Someone commented on your post',
          body: UtilityService.truncate(comment.body),
          href: this.getGoPath(comment),
        })

        await notification.save()
        await notification.trySendEmail(post.authors[i].id, trx)
      }
    } catch (error) {
      // await Logger.error('Failed to create post comment notification', {
      //   comment: JSON.stringify(comment),
      //   error
      // })
    }
  }

  static async onLessonRequestCommentCreate(
    comment: Comment,
    user?: User,
    trx: TransactionClientContract | null = null
  ) {
    try {
      const lessonRequest = await LessonRequest.findOrFail(comment.lessonRequestId)
      const notification = new Notification()

      if (trx) {
        notification.useTransaction(trx)
      }

      notification.merge({
        userId: lessonRequest.userId,
        initiatorUserId: user?.id,
        notificationTypeId: NotificationTypes.COMMENT,
        table: Comment.table,
        tableId: comment.id,
        title: user
          ? `${user.username} commented on your request`
          : 'Someone commented on your request',
        body: UtilityService.truncate(comment.body),
        href: this.getGoPath(comment),
      })

      await notification.save()
      await notification.trySendEmail(lessonRequest.userId, trx)
    } catch (error) {
      // await Logger.error('Failed to create lesson request comment notification', {
      //   comment: JSON.stringify(comment),
      //   error
      // })
    }
  }

  /**
   * creates comment reply notification
   * @param comment
   * @param user
   * @param trx
   * @returns
   */
  static async onCommentReply(
    comment: Comment,
    user?: User,
    trx: TransactionClientContract | null = null
  ) {
    try {
      const parentComment = await Comment.findOrFail(comment.replyTo)
      const userId = parentComment.userId

      if (!userId) {
        return
      }

      const notification = new Notification()

      if (trx) {
        notification.useTransaction(trx)
      }

      notification.merge({
        userId,
        initiatorUserId: user?.id,
        notificationTypeId: NotificationTypes.COMMENT_REPLY,
        table: Comment.table,
        tableId: comment.id,
        title: user
          ? `${user.username} replied to your comment`
          : 'Someone replied to your comment',
        body: UtilityService.truncate(comment.body),
        href: this.getGoPath(comment),
      })

      await notification.save()
      await notification.trySendEmail(userId, trx)
    } catch (error) {
      // await Logger.error('Failed to create comment reply notification', {
      //   comment: JSON.stringify(comment),
      //   error
      // })
    }
  }

  /**
   * returns go path url for comment
   * @param comment
   * @returns
   */
  static getGoPath(comment: Comment) {
    if (comment.lessonRequestId) {
      return `/go/requests/lessons/${comment.lessonRequestId}/comment/${comment.id}`
    }

    return `/go/posts/${comment.postId}/comment/${comment.id}`
  }
}
