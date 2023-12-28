import HttpStatus from '#enums/http_statuses'
import NotificationService from '#services/notification_service'
import type { HttpContext } from '@adonisjs/core/http'

export default class FragmentsController {
  public async headerNotifications({ view, request, response, session, auth }: HttpContext) {
    const previousUnread = request.qs().unreadCount
    const unreadCount = parseInt(await NotificationService.getUnreadCount(auth.user?.id))

    if (previousUnread && previousUnread != unreadCount) {
      session.flash('success', `You have ${unreadCount} unread notifications`)
    } else if (previousUnread && previousUnread == unreadCount) {
      return response.status(HttpStatus.NOT_MODIFIED)
    }

    return view.render('components/layout/header/notifications', { unreadCount })
  }
}