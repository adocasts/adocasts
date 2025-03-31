import type { HttpContext } from '@adonisjs/core/http'
import GetSeriesRecentlyUpdated from '#collection/actions/get_series_recently_updated'
import GetTopics from '#taxonomy/actions/get_topics'
import GetLessonsLatest from '#post/actions/get_lessons_latest'

export default class HomeController {
  async handle({ view }: HttpContext) {
    const topics = await GetTopics.fromCache()
    const lessons = await GetLessonsLatest.fromCache()
    const series = await GetSeriesRecentlyUpdated.fromCache({ limit: 5 })

    return view.render('pages/home', { series, topics, lessons })
  }
}
