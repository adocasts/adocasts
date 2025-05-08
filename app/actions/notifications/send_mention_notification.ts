import Comment from '#models/comment'
import BaseAction from '#actions/base_action'
import logger from '#services/logger_service'
import Discussion from '#models/discussion'
import LessonRequest from '#models/lesson_request'
import User from '#models/user'
import { TransactionClientContract } from '@adonisjs/lucid/types/database'
import SendNotification from './send_notification.js'
import router from '@adonisjs/core/services/router'
import NotImplementedException from '#exceptions/not_implemented_exception'
import NotificationTypes from '#enums/notification_types'
import GetMentions from './get_mentions.js'
import { InvalidArgumentsException } from '@adonisjs/core/exceptions'

type Record = Comment | Discussion | LessonRequest

export interface SendMentionNotificationInterface {
  record: Record
  user: User
  mentions?: string[]
  skipUserIds?: number[]
  trx?: TransactionClientContract
}

interface MentionNotificationInterface {
  record: Record
  notifyUserId: number
  initiatingUserId: number
  title: string
  trx?: TransactionClientContract
}

export default class SendMentionNotification extends BaseAction<
  [SendMentionNotificationInterface]
> {
  async handle({ record, user, mentions, skipUserIds, trx }: SendMentionNotificationInterface) {
    return this.#manage(record, async () => {
      const userIds: number[] = []
      const usernames = mentions ?? GetMentions.run(record.body)

      if (!usernames.length) return userIds

      if (usernames.length > 3) {
        throw new InvalidArgumentsException(
          `To many users were mentioned. To help limit spam, we ask that you please keep to a maximum of 3 mentions. Thank you`
        )
      }

      for (const username of usernames) {
        const mentioned = await User.query().whereRaw('lower(username) = ?', [username]).first()

        if (!mentioned) continue
        if (skipUserIds?.includes(mentioned.id)) continue

        const ids = await this.#createNotification({
          trx,
          record,
          notifyUserId: mentioned.id,
          initiatingUserId: user.id,
          title: `${user.handle} mentioned you in their comment`,
        })

        userIds.push(...ids)
      }

      return userIds
    })
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

  async #manage(record: Record, callback: () => Promise<number[]>) {
    try {
      return callback()
    } catch (error) {
      await logger.error('Failed to create mention notification', {
        record: record.serialize(),
        error,
      })

      throw error
    }
  }
}
