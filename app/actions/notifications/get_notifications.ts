import BaseAction from '#actions/base_action'
import Notification from '#models/notification'

export interface NotificationInterface {
  unread: Notification[]
  read: Notification[]
}

export default class GetNotifications extends BaseAction {
  async handle(userId: number | undefined) {
    const result: NotificationInterface = { unread: [], read: [] }

    if (!userId) return result

    result.unread = await GetNotifications.unread(userId).orderBy('createdAt', 'desc')
    result.read = await GetNotifications.read(userId).orderBy('createdAt', 'desc')

    return result
  }

  static unread(userId: number) {
    return Notification.query().where({ userId }).whereNull('readAt')
  }

  static read(userId: number, limit: number = 25) {
    return Notification.query().where({ userId }).whereNotNull('readAt').limit(limit)
  }
}
