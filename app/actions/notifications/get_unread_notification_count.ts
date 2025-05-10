import BaseAction from '#actions/base_action'
import GetNotifications from './get_notifications.js'

export default class GetUnreadNotificationCount extends BaseAction<[number | undefined]> {
  async handle(userId: number | undefined) {
    if (!userId) return 0

    const result = await GetNotifications.unread(userId).getCount()

    return Number(result)
  }
}
