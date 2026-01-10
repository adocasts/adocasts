import BaseAction from '#actions/base_action'
import { HttpContext } from '@adonisjs/core/http'
import GetSeries from './get_series.js'

export default class RenderSeriesShow extends BaseAction {
  async asController({ view, params, auth }: HttpContext) {
    const series = await GetSeries.run(params.slug, auth.user?.id, true)

    return view.render('pages/series/show', { series })
  }
}
