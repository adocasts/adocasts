import WatchlistService from '#services/watchlist_service'
import { watchlistValidator } from '#validators/watchlist_validator'
import { inject } from '@adonisjs/core'
import type { HttpContext } from '@adonisjs/core/http'

@inject()
export default class WatchlistsController {
  constructor(protected watchlistService: WatchlistService) {}

  async index({}: HttpContext) {}

  public async toggle({ response, request, view, params }: HttpContext) {
    const { fragment, ...data } = await request.validateUsing(watchlistValidator)
    const { wasDeleted } = await this.watchlistService.toggle(data)

    return fragment
      ? view.render(fragment, { table: params.table, active: !wasDeleted, ...data })
      : response.redirect().back()
  }
}