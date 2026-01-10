import BaseAction from '#actions/base_action'
import User from '#models/user'
import { watchlistCollectionValidator } from '#validators/watchlist'
import { HttpContext } from '@adonisjs/core/http'
import GetSeries from './get_series.js'

export default class ToggleSeriesWatchlist extends BaseAction {
  validator = watchlistCollectionValidator

  async asController({ view, auth, params }: HttpContext) {
    const series = await GetSeries.run(params.slug)
    const result = await this.handle(auth.user!, series.id)

    series.meta.isInWatchlist = result.isInWatchlist

    view.share({ isFragment: true })

    return view.render('components/frags/series/watchlist_toggle', { series })
  }

  async handle(user: User, collectionId: number) {
    const record = await user.related('watchlist').query().where({ collectionId }).first()

    const watchlist = record
      ? await record.delete()
      : await user.related('watchlist').create({ collectionId })

    return { watchlist, isInWatchlist: !record }
  }
}
