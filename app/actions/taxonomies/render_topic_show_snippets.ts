import BaseAction from '#actions/base_action'
import GetSeriesPaginated from '#actions/collections/get_series_paginated'
import GetDiscussionsPaginated from '#actions/discussions/get_discussions_paginated'
import GetLessonsPaginated from '#actions/posts/get_lessons_paginated'
import GetSnippetsPaginated from '#actions/posts/get_snippets_paginated'
import { topicPaginatorValidator } from '#validators/topics'
import { HttpContext } from '@adonisjs/core/http'
import { Infer } from '@vinejs/vine/types'
import GetTopic from './get_topic.js'

type Validator = Infer<typeof topicPaginatorValidator>

export default class RenderTopicShowSnippets extends BaseAction {
  validator = topicPaginatorValidator

  async asController({ view, params }: HttpContext, data: Validator) {
    const topic = await GetTopic.run(params.slug)
    const snippets = await this.#getSnippets(params.slug, data)

    const series = await GetSeriesPaginated.run({ topics: [topic.slug], perPage: 1 })
    const discussions = await GetDiscussionsPaginated.run({ topics: [topic.slug], perPage: 1 })
    const lessons = await GetLessonsPaginated.run({ topics: [topic.slug], perPage: 1 })

    return view.render('pages/topics/snippets', { topic, series, discussions, lessons, snippets })
  }

  #getSnippets(topic: string, { page, perPage }: Validator) {
    return GetSnippetsPaginated.run({ topics: [topic], page, perPage }, 'topics.show.snippets', {
      slug: topic,
    })
  }
}
