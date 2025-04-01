import { seriesIndexValidator } from '#collection/validators/series'
import BaseAction from '#core/actions/base_action'
import GetTopicsFilter from '#taxonomy/actions/get_topics_filter'
import { HttpContext } from '@adonisjs/core/http'
import GetSeriesRecentlyUpdated from './get_series_recently_updated.js'
import { Infer } from '@vinejs/vine/types'
import GetSeries from '#collection/actions/get_series'

export default class PageSeriesIndex extends BaseAction {
  validator = seriesIndexValidator

  async authorize(_ctx: HttpContext) {
    return true
  }

  async asController({ view }: HttpContext, filters: Infer<typeof this.validator>) {
    const latest = await GetSeriesRecentlyUpdated.fromCache({ limit: 5 })
    const topics = await GetTopicsFilter.forCollections()
    const series = await GetSeries.fromCache(filters)

    return view.render('pages/series/index', { latest, series, topics })
  }
}
