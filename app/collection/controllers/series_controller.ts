import { seriesIndexValidator } from '#collection/validators/series'
import type { HttpContext } from '@adonisjs/core/http'
import GetSeriesRecentlyUpdated from '#collection/actions/get_series_recently_updated'
import GetTopicsFilter from '#taxonomy/actions/get_topics_filter'

export default class SeriesController {
  async index({ view, request }: HttpContext) {
    const filters = await request.validateUsing(seriesIndexValidator)
    const latest = await GetSeriesRecentlyUpdated.fromCache({ limit: 5 })
    const topics = await GetTopicsFilter.forCollections()
    const series = await GetSeriesRecentlyUpdated.fromCache()

    return view.render('pages/series/index', { latest, series, topics })
  }

  async show({ }: HttpContext) { }
}
