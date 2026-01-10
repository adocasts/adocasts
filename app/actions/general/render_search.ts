import BaseAction from '#actions/base_action'
import GetSeriesPaginated from '#actions/collections/get_series_paginated'
import GetLessonsPaginated from '#actions/posts/get_lessons_paginated'
import GetTopicsFilter from '#actions/taxonomies/get_topics_filter'
import { searchValidator } from '#validators/search'
import { HttpContext } from '@adonisjs/core/http'
import { Infer } from '@vinejs/vine/types'

type Validator = Infer<typeof searchValidator>

export default class RenderSearch extends BaseAction {
  validator = searchValidator

  async asController({ view, params }: HttpContext, filters: Validator) {
    const feed = params.feed ?? 'series'
    const data = await this.handle(feed, filters)

    return view.render('pages/search/index', { ...data, filters })
  }

  async handle(feed: string, filters: Validator) {
    switch (feed) {
      case 'lessons':
        return {
          feed,
          lessons: await GetLessonsPaginated.run(filters, 'search', { feed: 'lessons' }),
          topics: await GetTopicsFilter.run('lessons'),
        }
      default:
        return {
          feed,
          series: await GetSeriesPaginated.run(filters, 'search', { feed: 'series' }),
          topics: await GetTopicsFilter.run('collections'),
        }
    }
  }
}
