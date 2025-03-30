import { seriesIndexValidator } from '#validators/series'
import type { HttpContext } from '@adonisjs/core/http'
import GetSeriesRecentlyUpdated from '../actions/series/get_series_recently_updated.js'
import GetTopics from '../actions/topics/get_topics.js'

export default class SeriesController {
  async index({ view, request }: HttpContext) {
    const filters = await request.validateUsing(seriesIndexValidator)

    const latest = await GetSeriesRecentlyUpdated.fromCache({ limit: 5 })
    const topics = await GetTopics.fromCache()
    const series = await GetSeriesRecentlyUpdated.fromCache({
      withPosts: true,
      postLimit: 5,
    })

    return view.render('pages/series/index', { latest, series, topics })
  }

  async show({}: HttpContext) {}
}
