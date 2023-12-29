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
import logger from './logger_service.js'
import Discussion from '#models/discussion'
import router from '@adonisjs/core/services/router'

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
    } else if (comment.discussionId) {
      return this.onDiscussionCommentCreate(comment, user, trx)
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
      await logger.error('Failed to create post comment notification', {
        comment: JSON.stringify(comment),
        error
      })
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
      await logger.error('Failed to create lesson request comment notification', {
        comment: JSON.stringify(comment),
        error
      })
    }
  }

  static async onDiscussionCommentCreate(
    comment: Comment,
    user?: User,
    trx: TransactionClientContract | null = null
  ) {
    try {
      const discussion = await Discussion.findOrFail(comment.discussionId)
      const notification = new Notification()

      if (trx) {
        notification.useTransaction(trx)
      }

      notification.merge({
        userId: discussion.userId,
        initiatorUserId: user?.id,
        notificationTypeId: NotificationTypes.COMMENT,
        table: Comment.table,
        tableId: comment.id,
        title: user
          ? `${user.username} replied to your discussion`
          : 'Someone replied to your discussion',
        body: UtilityService.truncate(comment.body),
        href: this.getGoPath(comment),
      })

      await notification.save()
      await notification.trySendEmail(discussion.userId, trx)
    } catch (error) {
      await logger.error('Failed to create discussion comment notification', {
        comment: JSON.stringify(comment),
        error
      })
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
      await logger.error('Failed to create comment reply notification', {
        comment: JSON.stringify(comment),
        error
      })
    }
  }

  static async onCommentMention(
    comment: Comment,
    usernames: string[],
    user: User,
    trx: TransactionClientContract | null = null
  ) {
    try {
      for (let i = 0; i < usernames.length; i++) {
        const notification = new Notification()
        const mentioned = await User.query().whereILike('username', usernames[i]).first()

        if (!mentioned) {
          await logger.warn(`Failed to find username ${usernames[i]} mentioned in comment ${comment.id}`)
          continue
        }

        if (trx) {
          notification.useTransaction(trx)
        }

        notification.merge({
          userId: mentioned.id,
          initiatorUserId: user.id,
          notificationTypeId: NotificationTypes.MENTION,
          table: Comment.table,
          tableId: comment.id,
          title: user
            ? `${user.username} mentioned you in their comment`
            : 'Someone mentioned you in their comment',
          body: UtilityService.truncate(comment.body),
          href: this.getGoPath(comment),
        })

        await notification.save()
        await notification.trySendEmail(mentioned.id, trx)
      }
    } catch (error) {
      await logger.error('Failed to create comment mention notification', {
        commentId: comment.id,
        usernames,
        error
      })
    }
  }

  static async onPostMention(
    post: Post,
    usernames: string[],
    user: User,
    trx: TransactionClientContract | null = null
  ) {
    try {
      for (let i = 0; i < usernames.length; i++) {
        const notification = new Notification()
        const mentioned = await User.query().whereILike('username', usernames[i]).first()

        if (!mentioned) {
          await logger.warn(`Failed to find username ${usernames[i]} mentioned in post ${post.id}`)
          continue
        }

        if (trx) {
          notification.useTransaction(trx)
        }

        notification.merge({
          userId: mentioned.id,
          initiatorUserId: user.id,
          notificationTypeId: NotificationTypes.MENTION,
          table: Post.table,
          tableId: post.id,
          title: user
            ? `${user.username} mentioned you in their post`
            : 'Someone mentioned you in their post',
          body: post.body ? UtilityService.truncate(post.body) : '',
          href: post.routeUrl,
        })

        await notification.save()
        await notification.trySendEmail(mentioned.id, trx)
      }
    } catch (error) {
      await logger.error('Failed to create comment mention notification', {
        postId: post.id,
        usernames,
        error
      })
    }
  }

  static async onDiscussionMention(
    discussion: Discussion,
    usernames: string[],
    user: User,
    trx: TransactionClientContract | null = null
  ) {
    try {
      for (let i = 0; i < usernames.length; i++) {
        const notification = new Notification()
        const mentioned = await User.query().whereILike('username', usernames[i]).first()

        if (!mentioned) {
          await logger.warn(`Failed to find username ${usernames[i]} mentioned in discussion ${discussion.id}`)
          continue
        }

        if (trx) {
          notification.useTransaction(trx)
        }

        notification.merge({
          userId: mentioned.id,
          initiatorUserId: user.id,
          notificationTypeId: NotificationTypes.MENTION,
          table: Discussion.table,
          tableId: discussion.id,
          title: user
            ? `${user.username} mentioned you in their discussion`
            : 'Someone mentioned you in their discussion',
          body: discussion.body ? UtilityService.truncate(discussion.body) : '',
          href: router.makeUrl('feed.show', { slug: discussion.slug }),
        })

        await notification.save()
        await notification.trySendEmail(mentioned.id, trx)
      }
    } catch (error) {
      await logger.error('Failed to create comment mention notification', {
        discussionId: discussion.id,
        usernames,
        error
      })
    }
  }

  static async onLessonRequestMention(
    request: LessonRequest,
    usernames: string[],
    user: User,
    trx: TransactionClientContract | null = null
  ) {
    try {
      for (let i = 0; i < usernames.length; i++) {
        const notification = new Notification()
        const mentioned = await User.query().whereILike('username', usernames[i]).first()

        if (!mentioned) {
          await logger.warn(`Failed to find username ${usernames[i]} mentioned in lesson request ${request.id}`)
          continue
        }

        if (trx) {
          notification.useTransaction(trx)
        }

        notification.merge({
          userId: mentioned.id,
          initiatorUserId: user.id,
          notificationTypeId: NotificationTypes.MENTION,
          table: LessonRequest.table,
          tableId: request.id,
          title: user
            ? `${user.username} mentioned you in their lesson request`
            : 'Someone mentioned you in their lesson request',
          body: request.body ? UtilityService.truncate(request.body) : '',
          href: router.makeUrl('requests.lessons.show', { id: request.id }),
        })

        await notification.save()
        await notification.trySendEmail(mentioned.id, trx)
      }
    } catch (error) {
      await logger.error('Failed to create comment mention notification', {
        lessonRequestId: request.id,
        usernames,
        error
      })
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

    if (comment.discussionId) {
      return `/go/discussions/${comment.discussionId}/comment/${comment.id}`
    }

    return `/go/posts/${comment.postId}/comment/${comment.id}`
  }
}
