import Comment from '#comment/models/comment'
import BaseAction from '#core/actions/base_action'
import Discussion from '#discussion/models/discussion'
import LessonRequest from '#lesson_request/models/lesson_request'
import NotificationTypes from '#notification/enums/notification_types'
import Notification from '#notification/models/notification'
import stringHelpers from '@adonisjs/core/helpers/string'
import { TransactionClientContract } from '@adonisjs/lucid/types/database'
import { LucidModel } from '@adonisjs/lucid/types/model'

export interface SendNotificationInterface<T extends LucidModel> {
  model: T
  record: Comment | Discussion | LessonRequest
  notificationTypeId: NotificationTypes
  notifyUserId: number
  initiatingUserId: number
  title: string
  href: string
  trx?: TransactionClientContract
}

export default class SendNotification<T extends LucidModel> extends BaseAction<
  [SendNotificationInterface<T>]
> {
  async handle(data: SendNotificationInterface<T>) {
    if (this.#getIsSelf(data)) return []

    const notification = await Notification.create(
      {
        userId: data.notifyUserId,
        initiatorUserId: data.initiatingUserId,
        notificationTypeId: data.notificationTypeId,
        table: data.model.table,
        tableId: data.record.id,
        body: stringHelpers.excerpt(data.record.body, 255, { completeWords: true }),
        href: data.href,
      },
      { client: data.trx }
    )

    await notification.trySendEmail(data.notifyUserId, trx)

    return [data.notifyUserId]
  }

  #getIsSelf({ notifyUserId, initiatingUserId }: SendNotificationInterface<T>) {
    return notifyUserId === initiatingUserId
  }
}
