import BaseAction from '#actions/base_action'
import Notification from '#models/notification'
import { DateTime } from 'luxon'

export default class MarkNotificationRead extends BaseAction<[Notification[] | Notification]> {
  async handle(notifications: Notification[] | Notification) {
    if (!Array.isArray(notifications)) {
      notifications = [notifications]
    }

    if (!notifications.length) return

    const ids = notifications.map((notification) => notification.id)

    await Notification.query().whereIn('id', ids).update({ readAt: DateTime.now() })
  }
}
