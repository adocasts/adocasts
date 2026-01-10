import BaseAction from '#actions/base_action'
import GetTopicsFilter from '#actions/taxonomies/get_topics_filter'
import { seriesIndexValidator } from '#validators/series'
import { HttpContext } from '@adonisjs/core/http'
import { Infer } from '@vinejs/vine/types'
import GetSeriesList from './get_series_list.js'

export default class RenderSeriesIndex extends BaseAction {
  validator = seriesIndexValidator

  async asController({ view }: HttpContext, filters: Infer<typeof this.validator>) {
    const series = await GetSeriesList.run(filters)
    const topics = await GetTopicsFilter.run('collections')

    return view.render('pages/series/index', { filters, series, topics })
  }
}
