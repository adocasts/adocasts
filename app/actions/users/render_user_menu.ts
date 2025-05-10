import BaseAction from '#actions/base_action'
import GetNotifications from '#actions/notifications/get_notifications'
import MarkNotificationRead from '#actions/notifications/mark_notification_read'
import { HttpContext } from '@adonisjs/http-server'

export default class RenderUserMenu extends BaseAction {
  async asController({ view, auth }: HttpContext) {
    const notifications = await GetNotifications.run(auth.user?.id)

    await MarkNotificationRead.run(notifications.unread)

    return view.render('pages/users/menu', { notifications })
  }
}
