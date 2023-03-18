import type { HttpContextContract } from '@ioc:Adonis/Core/HttpContext'
import NotificationService from 'App/Services/NotificationService'

export default class UsersController {
  public async menu({ response, view, auth }: HttpContextContract) {
    const notifications = await NotificationService.getForUser(auth.user)

    await NotificationService.markAsRead(notifications.unread)

    if (notifications.unread.length) {
      response.header('X-Up-Clear-Cache', '/users/*')
    }

    return view.render('pages/users/menu', { notifications })
  }
}
