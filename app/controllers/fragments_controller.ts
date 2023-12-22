import NotificationService from '#services/notification_service'
import type { HttpContext } from '@adonisjs/core/http'

export default class FragmentsController {
  public async headerNotifications({ view, request, session, auth }: HttpContext) {
    const previousUnread = request.qs().unreadCount
    const unreadCount = parseInt(await NotificationService.getUnreadCount(auth.user?.id))

    if (previousUnread && previousUnread != unreadCount) {
      session.flash('success', `You have ${unreadCount} unread notifications`)
    }

    return view.render('components/layout/header/notifications', { unreadCount })
  }
}