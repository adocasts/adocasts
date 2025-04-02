import GetSeries from '#collection/actions/get_series'
import GetSeriesRecentlyUpdated from '#collection/actions/get_series_recently_updated'
import { seriesIndexValidator } from '#collection/validators/series'
import BaseAction from '#core/actions/base_action'
import GetTopicsFilter from '#taxonomy/actions/get_topics_filter'
import { HttpContext } from '@adonisjs/core/http'
import { Infer } from '@vinejs/vine/types'

export default class RenderSeriesIndex extends BaseAction<[number, string]> {
  validator = seriesIndexValidator

  async authorize(_ctx: HttpContext) {
    return true
  }

  async handle(id: number, name: string) {
    return `ID: ${id}, Name: ${name}`
  }

  async asController({ view }: HttpContext, _filters: Infer<typeof this.validator>) {
    const latest = await GetSeriesRecentlyUpdated.run('db', { limit: 5 })
    const topics = await GetTopicsFilter.forCollections()
    const series = await GetSeries.run()

    return view.render('pages/series/index', { latest, series, topics })
  }
}

RenderSeriesIndex.run(1, 'test')
