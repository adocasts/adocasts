import BaseAction from '#actions/base_action'
import GetTopicList from '#actions/taxonomies/get_topic_list'
import GetUserStats from '#actions/users/get_user_stats'
import { HttpContext } from '@adonisjs/core/http'
import GetSeriesRecentlyUpdated from '../collections/get_series_recently_updated.js'
import GetLessonsLatest from '../posts/get_lessons_latest.js'
import GetSiteStats from './get_site_stats.js'

export default class RenderHome extends BaseAction {
  async asController({ view, auth }: HttpContext) {
    const topics = await GetTopicList.run()
    const lessons = await GetLessonsLatest.run()
    const series = await GetSeriesRecentlyUpdated.run({ limit: 5 })
    const stats = auth.user ? await GetUserStats.run(auth.user) : await GetSiteStats.run()

    return view.render('pages/home', { series, topics, lessons, stats })
  }
}
