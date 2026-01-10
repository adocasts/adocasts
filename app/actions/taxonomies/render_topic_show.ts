import BaseAction from '#actions/base_action'
import GetSeriesPaginated from '#actions/collections/get_series_paginated'
import GetDiscussionsPaginated from '#actions/discussions/get_discussions_paginated'
import GetSnippetsPaginated from '#actions/posts/get_snippets_paginated'
import { HttpContext } from '@adonisjs/core/http'
import GetLessonsPaginated from '../posts/get_lessons_paginated.js'
import GetTopic from './get_topic.js'

export default class RenderTopicShow extends BaseAction {
  async asController({ view, params }: HttpContext) {
    const topic = await GetTopic.run(params.slug)
    const series = await GetSeriesPaginated.run({ topics: [topic.slug], perPage: 9 })
    const discussions = await GetDiscussionsPaginated.run({ topics: [topic.slug], perPage: 6 })
    const lessons = await GetLessonsPaginated.run({ topics: [topic.slug], perPage: 9 })
    const snippets = await GetSnippetsPaginated.run({ topics: [topic.slug], perPage: 6 })

    return view.render('pages/topics/show', {
      topic,
      series,
      discussions,
      lessons,
      snippets,
    })
  }
}
