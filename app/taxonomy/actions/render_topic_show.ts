import BaseAction from '#core/actions/base_action'
import { HttpContext } from '@adonisjs/core/http'
import GetTopic from './get_topic.js'
import GetTopicSeriesList from './get_topic_series_list.js'

export default class RenderTopicShow extends BaseAction {
  async asController({ view, params }: HttpContext) {
    const topic = await GetTopic.run(params.slug)
    const series = await GetTopicSeriesList.run(topic.slug)

    return view.render('pages/topics/show', { topic, series })
  }
}
