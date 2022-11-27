import type { HttpContextContract } from '@ioc:Adonis/Core/HttpContext'
import Themes from 'App/Enums/Themes'
import HistoryService from 'App/Services/Http/HistoryService'
import NotificationService from 'App/Services/NotificationService'

export default class UsersController {
  public async menu({ view, auth }: HttpContextContract) {
    const notifications = await NotificationService.getForDisplay(auth.user)
    const seriesProgress = await HistoryService.getLatestSeriesProgress(auth.user!, 5)
    return view.render('user/menu', { notifications, seriesProgress })
  }

  public async theme({ response, auth, session, params }: HttpContextContract) {
    const { theme } = params

    if (Object.values(Themes).includes(theme)) {
      auth.user?.merge({ theme })
      await auth.user?.save()
      session.put('theme', theme)
    }

    return response.status(204)
  }
}
