import type { HttpContext } from '@adonisjs/core/http'
import GetSeriesRecentlyUpdated from '../actions/series/get_series_recently_updated.js'
import GetTopics from '../actions/topics/get_topics.js'
import GetLessonsLatest from '../actions/lessons/get_lessons_latest.js'

export default class HomeController {
  async handle({ view }: HttpContext) {
    const topics = await GetTopics.fromCache()
    const lessons = await GetLessonsLatest.fromCache()
    const series = await GetSeriesRecentlyUpdated.fromCache({ limit: 5 })

    return view.render('pages/home', { series, topics, lessons })
  }
}
