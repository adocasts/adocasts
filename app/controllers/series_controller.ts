import { seriesIndexValidator } from '#validators/series'
import type { HttpContext } from '@adonisjs/core/http'
import GetSeriesRecentlyUpdated from '../actions/series/get_series_recently_updated.js'

export default class SeriesController {
  async index({ view, request }: HttpContext) {
    const {
      page = 1,
      sort = 'latest',
      topics = [],
    } = await request.validateUsing(seriesIndexValidator)

    if (page === 1) {
      const latest = await GetSeriesRecentlyUpdated.fromCache({ limit: 5 })
      view.share({ latest })
    }

    const series = await GetSeriesRecentlyUpdated.fromCache({
      withPosts: true,
      postLimit: 5,
    })

    return view.render('pages/series/index', { series })
  }

  async show({}: HttpContext) {}
}
