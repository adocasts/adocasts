import GetSeriesList from '#collection/actions/get_series_list'
import BaseAction from '#core/actions/base_action'
import { HttpContext } from '@adonisjs/core/http'
import GetTopic from './get_topic.js'

export default class RenderTopicShow extends BaseAction {
  async asController({ view, params }: HttpContext) {
    const topic = await GetTopic.run(params.slug)
    const series = await GetSeriesList.run({ topic: topic.slug })

    return view.render('pages/topics/show', { topic, series })
  }
}
