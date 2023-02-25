import { TransactionClientContract } from "@ioc:Adonis/Lucid/Database"
import Notification from "App/Models/Notification"
import User from "App/Models/User"
import UtilityService from "./UtilityService"
import Comment from 'App/Models/Comment'
import NotificationTypes from "App/Enums/NotificationTypes"
import Logger from "@ioc:Logger/Discord"
import Post from "App/Models/Post"

export default class NotificationService {
  /**
   * Get notifications for a user (or stub for unauthenticated users)
   * @param user 
   * @param stub 
   * @returns 
   */
  public static async getForUser(user: User | undefined, stub: boolean = false) {
    if (!user || stub) return {
      unread: [],
      read: []
    }

    return {
      unread: await this.getUnreadByUserId(user.id),
      read: await this.getReadByUserId(user.id)
    }
  } 

  /**
   * Get unread notifications for a user
   * @param userId 
   * @returns 
   */
  public static async getUnreadByUserId(userId: number) {
    return Notification.query()
      .where({ userId })
      .whereNull('readAt')
      .orderBy('createdAt', 'desc')
  }

  /**
   * Get read notifications for a user
   * @param userId 
   * @param limit 
   * @returns 
   */
  public static async getReadByUserId(userId: number, limit: number = 25) {
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
  public static async onUpdate(table: string, tableId: number, body: string, trx: TransactionClientContract | null = null) {
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
  public static async onDelete(table: string, tableId: number, trx: TransactionClientContract | null = null) {
    const query = trx ? Notification.query({ client: trx }) : Notification.query()
    return query.where({ table, tableId }).delete()
  }

  /**
   * creates comment notification
   * @param comment 
   * @param user 
   */
  public static async onCommentCreate(comment: Comment, user?: User, trx: TransactionClientContract | null = null) {
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
          title: user ? `${user.username} commented` : "Someone commented",
          body: UtilityService.truncate(comment.body),
          href: this.getGoPath(comment)
        })

        await notification.save()
      }
    } catch (error) {
      await Logger.error('Failed to create comment notification', {
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
  public static async onCommentReply(comment: Comment, user?: User, trx: TransactionClientContract | null = null) {
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
        title: user ? `${user.username} replied to your comment` : "Someone replied to your comment",
        body: UtilityService.truncate(comment.body),
        href: this.getGoPath(comment)
      })

      await notification.save()
    } catch (error) {
      await Logger.error('Failed to create comment reply notification', {
        comment: JSON.stringify(comment),
        error
      })
    }
  }

  /**
   * returns go path url for comment
   * @param comment 
   * @returns 
   */
  public static getGoPath(comment: Comment) {
    return `/go/post/${comment.postId}/comment/${comment.id}`
  }
}