import GetSeriesList from '../collections/get_series_list.js'
import BaseAction from '#actions/base_action'
import { HttpContext } from '@adonisjs/core/http'
import GetTopic from './get_topic.js'
import GetLessonsPaginated from '../posts/get_lessons_paginated.js'
import GetDiscussionsPaginated from '#actions/discussions/get_discussions_paginated'

export default class RenderTopicShow extends BaseAction {
  async asController({ view, params }: HttpContext) {
    const topic = await GetTopic.run(params.slug)
    const series = await GetSeriesList.run({ topic: topic.slug })
    const discussions = await GetDiscussionsPaginated.run({ topic: topic.slug, perPage: 6 })
    const lessons = await GetLessonsPaginated.run({ topic: topic.slug, perPage: 9 })

    return view.render('pages/topics/show', { topic, series, discussions, lessons })
  }
}
