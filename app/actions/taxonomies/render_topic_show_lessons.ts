import { HttpContext } from '@adonisjs/core/http'
import GetTopic from './get_topic.js'
import GetSeriesPaginated from '#actions/collections/get_series_paginated'
import GetDiscussionsPaginated from '#actions/discussions/get_discussions_paginated'
import GetLessonsPaginated from '#actions/posts/get_lessons_paginated'
import BaseAction from '#actions/base_action'

export default class RenderTopicShowLessons extends BaseAction {
  async asController({ view, params }: HttpContext) {
    const topic = await GetTopic.run(params.slug)
    const series = await GetSeriesPaginated.run({ topic: topic.slug, perPage: 1 })
    const discussions = await GetDiscussionsPaginated.run({ topic: topic.slug, perPage: 1 })
    const lessons = await GetLessonsPaginated.run({ topic: topic.slug, perPage: 20 })

    return view.render('pages/topics/lessons', { topic, series, discussions, lessons })
  }
}
