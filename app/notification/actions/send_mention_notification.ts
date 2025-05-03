import Comment from '#comment/models/comment'
import BaseAction from '#core/actions/base_action'
import logger from '#core/services/logger_service'
import Discussion from '#discussion/models/discussion'
import LessonRequest from '#lesson_request/models/lesson_request'
import User from '#user/models/user'
import { TransactionClientContract } from '@adonisjs/lucid/types/database'
import SendNotification from './send_notification.js'
import router from '@adonisjs/core/services/router'
import NotImplementedException from '#core/exceptions/not_implemented_exception'
import NotificationTypes from '#notification/enums/notification_types'

export interface SendMentionNotificationInterface {
  record: Comment | Discussion | LessonRequest
  user: User
  skipUserIds?: number[]
  trx?: TransactionClientContract
}

interface MentionNotificationInterface {
  record: Comment | Discussion | LessonRequest
  notifyUserId: number
  initiatingUserId: number
  title: string
  trx?: TransactionClientContract
}

export default class SendMentionNotification extends BaseAction<
  [SendMentionNotificationInterface]
> {
  async handle({ record, user, skipUserIds, trx }: SendMentionNotificationInterface) {
    if (!record.body.includes('data-type="mention"')) return

    const usernames = this.#checkForMentions(record.body)

    // silence if no mentions found or to many mentions are found
    if (!usernames.length || usernames.length > 5) return

    for (const username of usernames) {
      const mentioned = await User.query().whereRaw('lower(username) = ?', [username]).first()

      if (!mentioned) continue
      if (skipUserIds?.includes(mentioned.id)) continue

      return this.#createNotification({
        trx,
        record,
        notifyUserId: mentioned.id,
        initiatingUserId: user.id,
        title: `${user.handle} mentioned you in their comment`,
      })
    }
  }

  #checkForMentions(body: string) {
    // get usernames from each data-id="id" where username can be alpha-numeric, dash, underscore, or period
    const matches = body.matchAll(/data-id="([a-zA-Z0-9_.-]+)"/g)

    // get usernames from regex matches
    return Array.from(matches).map((match) => match[1])
  }

  async #createNotification(data: MentionNotificationInterface) {
    return SendNotification.run({
      notificationTypeId: NotificationTypes.MENTION,
      ...data,
      ...this.#getNotificationModelInfo(data),
    })
  }

  #getNotificationModelInfo(data: MentionNotificationInterface) {
    if (data.record instanceof Comment) {
      return {
        href: data.record.goPath,
        model: Comment,
      }
    }

    if (data.record instanceof Discussion) {
      return {
        href: router.makeUrl('discussions.show', { slug: data.record.slug }),
        model: Discussion,
      }
    }

    if (data.record instanceof LessonRequest) {
      return {
        href: router.makeUrl('requests.lessons.show', { id: data.record.id }),
        model: LessonRequest,
      }
    }

    throw new NotImplementedException(
      'SendMentionNotificationService does not implement model provided'
    )
  }

  async #manage(comment: Comment, callback: () => Promise<number[]>) {
    try {
      return callback()
    } catch (error) {
      await logger.error('Failed to create mention notification', {
        comment: comment.serialize(),
        error,
      })

      throw error
    }
  }
}
