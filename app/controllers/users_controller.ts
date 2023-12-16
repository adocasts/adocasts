import HistoryBuilder from '#builders/history_builder'
import NotificationService from '#services/notification_service'
import WatchlistService from '#services/watchlist_service'
import { themeValidator } from '#validators/theme_validator'
import { inject } from '@adonisjs/core'
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

  @inject()
  public async watchlist({ view }: HttpContext, watchlistService: WatchlistService) {
    const posts = await watchlistService.getLatestPosts()
    const collections = await watchlistService.getLatestCollections()

    return view.render('pages/users/watchlist', { posts, collections })
  }

  public async history({ view, auth }: HttpContext) {
    const posts = await HistoryBuilder
      .new(auth.user)
      .progressions()
      .posts(builder => builder.display().paginate(1, 30))
    
    const collections = await HistoryBuilder
      .new(auth.user)
      .progressions()
      .collections(builder => builder.display().paginate(1, 30))

    return view.render('pages/users/history', { posts, collections })
  }

  public async check({ auth }: HttpContext) {
    return !!auth.user
  }
}