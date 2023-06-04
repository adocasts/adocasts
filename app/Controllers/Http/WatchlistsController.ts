import type { HttpContextContract } from '@ioc:Adonis/Core/HttpContext'
import WatchlistService from 'App/Services/WatchlistService'
import WatchlistValidator from 'App/Validators/WatchlistValidator'

export default class WatchlistsController {
  public async toggle({ request, view, auth }: HttpContextContract) {
    const data = await request.validate(WatchlistValidator)
    const [_, wasDeleted] = await WatchlistService.toggle(auth.user!, data)

    return view.render('components/fragments/watchlist', { isInWatchlist: !wasDeleted })
  }
}
