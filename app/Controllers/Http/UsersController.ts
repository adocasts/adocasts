import type { HttpContextContract } from '@ioc:Adonis/Core/HttpContext'
import HistoryService from 'App/Services/HistoryService'
import NotificationService from 'App/Services/NotificationService'
import WatchlistService from 'App/Services/WatchlistService'
import { schema, rules } from '@ioc:Adonis/Core/Validator'

export default class UsersController {
  public async menu({ response, view, auth }: HttpContextContract) {
    const notifications = await NotificationService.getForUser(auth.user)

    await NotificationService.markAsRead(notifications.unread)

    if (notifications.unread.length) {
      response.header('X-Up-Clear-Cache', '/users/*')
    }

    return view.render('pages/users/menu', { notifications })
  }

  public async watchlist({ view, auth }: HttpContextContract) {
    const posts = await WatchlistService.getLatestPosts(auth.user!)
    const collections = await WatchlistService.getLatestCollections(auth.user!)

    return view.render('pages/users/watchlist', { posts, collections })
  }

  public async history({ view, auth }: HttpContextContract) {
    const posts = await HistoryService.getLatestPostProgress(auth.user!)
    const collections = await HistoryService.getLatestSeriesProgress(auth.user!)

    return view.render('pages/users/history', { posts, collections })
  }

  public async check({ auth }: HttpContextContract) {
    return !!auth.user
  }

  public async billto({ request, response, auth }: HttpContextContract) {
    const _schema = schema.create({
      billToInfo: schema.string.nullableAndOptional([rules.maxLength(500)])
    })

    let clearedBillTo = false
    let { billToInfo } = await request.validate({ schema: _schema })
    let user = auth.user!

    if (billToInfo == '\n') {
      billToInfo = null
      clearedBillTo = true
    }

    await user.merge({ billToInfo }).save()

    return response.status(200).json({ clearedBillTo, billToInfo })
  }
}
