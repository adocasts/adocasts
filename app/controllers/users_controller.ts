import NotificationService from '#services/notification_service'
import { themeValidator } from '#validators/theme_validator'
import type { HttpContext } from '@adonisjs/core/http'

export default class UsersController {
  public async menu({ view, auth }: HttpContext) {
    const notifications = await NotificationService.getForUser(auth.user)

    await NotificationService.markAsRead(notifications.unread)

    return view.render('pages/users/menu', { notifications })
  }

  public async theme({ request, response, auth, session, up }: HttpContext) {
    const { theme } = await request.validateUsing(themeValidator)

    await auth.user?.merge({ theme }).save()

    session.put('theme', theme)

    up.setTarget('[up-theme]')

    return response.redirect().back()
  }
}