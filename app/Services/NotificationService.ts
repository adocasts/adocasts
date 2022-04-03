import NotificationType from 'App/Enums/NotificationType'
import Comment from 'App/Models/Comment'
import Notification from 'App/Models/Notification'
import Post from 'App/Models/Post'
import User from 'App/Models/User'
import Logger from '@ioc:Logger/Discord'
import { DateTime } from 'luxon'

export default class NotificationService {
  public static async getForDisplay(user: User | undefined, stub: boolean = false) {
    if (!user || stub) return {
      unread: [],
      read: []
    }

    return {
      unread: await this.getUnread(user.id),
      read: await this.getLatestRead(user.id)
    }
  }

  public static async getUnread(userId: number) {
    return Notification.query().where({ userId }).whereNull('readAt').orderBy('createdAt', 'desc')
  }

  public static async getLatestRead(userId: number) {
    return Notification.query().where({  userId }).whereNotNull('readAt').orderBy('createdAt', 'desc')
  }

  public static async onRead(notification_id: number) {
    try {
      const notification = await Notification.findOrFail(notification_id)

      notification.readAt = DateTime.utc()
      await notification.save()

      return notification
    } catch (error) {
      await Logger.error('Failed to mark notification as read', {
        notification_id,
      })
    }
  }

  public static async onUpdate(table: string, tableId: number, body: string) {
    await Notification.query().where({ table, tableId }).update({
      body: this.truncate(body)
    })
  }

  public static async onDelete(table: string, tableId: number) {
    await Notification.query().where({ table, tableId }).delete()
  }

  public static async onComment(comment: Comment, user?: User) {
    try {
      const post = await Post.findOrFail(comment.postId)
      await post.load('authors')

      for (let i = 0; i < post.authors.length; i++) {
        await Notification.create({
          userId: post.authors[i].id,
          initiatorUserId: user?.id,
          notificationTypeId: NotificationType.COMMENT,
          table: Comment.table,
          tableId: comment.id,
          title: user ? `${user.username} commented` : "Someone commented",
          body: this.truncate(comment.body),
          href: this.getGoPath(comment)
        })
      }
    } catch (error) {
      await Logger.error('Failed to create comment notification', {
        comment: JSON.stringify(comment),
        error
      })
    }
  }

  public static async onCommentReply(comment: Comment, user?: User) {
    try {
      const parentComment = await Comment.findOrFail(comment.replyTo)
      const userId = parentComment.userId

      if (!userId) {
        return
      }

      await Notification.create({
        userId,
        initiatorUserId: user?.id,
        notificationTypeId: NotificationType.COMMENT_REPLY,
        table: Comment.table,
        tableId: comment.id,
        title: user ? `${user.username} replied to your comment` : "Someone replied to your comment",
        body: this.truncate(comment.body),
        href: this.getGoPath(comment)
      })
    } catch (error) {
      await Logger.error('Failed to create comment reply notification', {
        comment: JSON.stringify(comment),
        error
      })
    }
  }

  public static getGoPath(comment: Comment) {
    return `/go/post/${comment.postId}/comment/${comment.id}`
  }

  private static truncate(string: string) {
    return string.length > 255 ? string.slice(0, 255) + "..." : string
  }
}
