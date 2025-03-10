import { inject } from '@adonisjs/core'
import type { HttpContext } from '@adonisjs/core/http'
import GetSeriesRecentlyUpdated from '../actions/series/get_series_recently_updated.js'

export default class HomeController {
  @inject()
  async handle({ view }: HttpContext, getSeriesRecentlyUpdated: GetSeriesRecentlyUpdated) {
    const series = await getSeriesRecentlyUpdated.handle({
      withPosts: true,
      limit: 6,
      postLimit: 5,
    })

    return view.render('pages/home', { series })
  }
}
