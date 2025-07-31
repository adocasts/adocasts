import BaseAction from '#actions/base_action'
import GetSeriesPaginated from '#actions/collections/get_series_paginated'
import GetTopicsFilter from '#actions/taxonomies/get_topics_filter'
import { seriesIndexValidator } from '#validators/series'
import { HttpContext } from '@adonisjs/core/http'
import { Infer } from '@vinejs/vine/types'

export default class RenderSearch extends BaseAction {
  validator = seriesIndexValidator

  async asController({ view }: HttpContext, filters: Infer<typeof this.validator>) {
    const series = await GetSeriesPaginated.run(filters)
    const topics = await GetTopicsFilter.run('collections')

    return view.render('pages/search/index', { series, topics })
  }
}
