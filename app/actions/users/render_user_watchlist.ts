import BaseAction from '#actions/base_action'
import GetSeriesPaginated from '#actions/collections/get_series_paginated'
import SeriesListDto from '#dtos/series_list'
import { watchlistShowValidator } from '#validators/watchlist'
import { HttpContext } from '@adonisjs/core/http'
import router from '@adonisjs/core/services/router'
import { Infer } from '@vinejs/vine/types'

type Validator = Infer<typeof watchlistShowValidator>

export default class RenderUserWatchlist extends BaseAction {
  #routeIdentifier = 'users.watchlist'

  validator = watchlistShowValidator

  async asController({ view, auth }: HttpContext, { page, perPage }: Validator) {
    const user = auth.user!
    const profile = await user.related('profile').query().firstOrFail()
    const series = await this.#getSeries(user.id, page, perPage)

    return view.render('pages/users/watchlist', { profile, series })
  }

  async #getSeries(userId: number, page: number = 1, perPage: number = 20) {
    const baseUrl = router.makeUrl(this.#routeIdentifier, { tab: 'series' })
    const paginator = await GetSeriesPaginated.fromDb()
      .selectDto(SeriesListDto)
      .whereInWatchlist(userId)
      .paginate(page, perPage, baseUrl)

    return SeriesListDto.fromPaginator(paginator, { start: 1, end: paginator.lastPage })
  }
}
