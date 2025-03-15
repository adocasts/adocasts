import type { HttpContext } from '@adonisjs/core/http'
import GetSeriesRecentlyUpdated from '../actions/series/get_series_recently_updated.js'
import GetTopics from '../actions/topics/get_topics.js'

export default class HomeController {
  async handle({ view }: HttpContext) {
    const topics = await GetTopics.fromCache()
    const series = await GetSeriesRecentlyUpdated.fromCache({
      withPosts: true,
      limit: 5,
      postLimit: 5,
    })

    return view.render('pages/home', { series, topics })
  }
}
