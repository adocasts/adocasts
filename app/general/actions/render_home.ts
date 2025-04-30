import GetSeriesRecentlyUpdated from '#collection/actions/get_series_recently_updated'
import BaseAction from '#core/actions/base_action'
import GetLessonsLatest from '#post/actions/get_lessons_latest'
import GetTopicList from '#taxonomy/actions/get_topic_list'
import { HttpContext } from '@adonisjs/core/http'

export default class RenderHome extends BaseAction {
  async asController({ view }: HttpContext) {
    const topics = await GetTopicList.run()
    const lessons = await GetLessonsLatest.run()
    const series = await GetSeriesRecentlyUpdated.run({ limit: 5 })

    return view.render('pages/home', { series, topics, lessons })
  }
}
