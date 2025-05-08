import GetSeriesRecentlyUpdated from '../collections/get_series_recently_updated.js'
import BaseAction from '#actions/base_action'
import GetLessonsLatest from '../posts/get_lessons_latest.js'
import GetTopicList from '#actions/taxonomies/get_topic_list'
import { HttpContext } from '@adonisjs/core/http'

export default class RenderHome extends BaseAction {
  async asController({ view }: HttpContext) {
    const topics = await GetTopicList.run()
    const lessons = await GetLessonsLatest.run()
    const series = await GetSeriesRecentlyUpdated.run({ limit: 5 })

    return view.render('pages/home', { series, topics, lessons })
  }
}
