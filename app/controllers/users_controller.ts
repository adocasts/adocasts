import NotificationService from '#services/notification_service'
import type { HttpContext } from '@adonisjs/core/http'

export default class UsersController {
  public async menu({ view, auth }: HttpContext) {
    const notifications = await NotificationService.getForUser(auth.user)

    await NotificationService.markAsRead(notifications.unread)

    return view.render('pages/users/menu', { notifications })
  }
}