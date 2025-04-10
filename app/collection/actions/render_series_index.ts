import GetSeriesList from '#collection/actions/get_series_list'
import GetSeriesRecentlyUpdated from '#collection/actions/get_series_recently_updated'
import { seriesIndexValidator } from '#collection/validators/series'
import BaseAction from '#core/actions/base_action'
import GetTopicsFilter from '#taxonomy/actions/get_topics_filter'
import { HttpContext } from '@adonisjs/core/http'
import { Infer } from '@vinejs/vine/types'

export default class RenderSeriesIndex extends BaseAction {
  validator = seriesIndexValidator

  async asController({ view }: HttpContext, filters: Infer<typeof this.validator>) {
    const latest = await GetSeriesRecentlyUpdated.run('db', { limit: 5 })
    const topics = await GetTopicsFilter.run('collections')
    const series = await GetSeriesList.run(filters)

    return view.render('pages/series/index', { filters, latest, series, topics })
  }
}
