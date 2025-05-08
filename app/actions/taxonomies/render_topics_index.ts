import BaseAction from '#actions/base_action'
import { ListService } from '#services/list_service'
import { HttpContext } from '@adonisjs/core/http'
import GetTopicList from './get_topic_list.js'

export default class RenderTopicsIndex extends BaseAction {
  async asController({ view }: HttpContext) {
    const topics = await GetTopicList.run()
    let featured = topics.filter((topic) => topic.isFeatured)

    featured = ListService.pluckRandom(featured, 4)

    return view.render('pages/topics/index', { featured, topics })
  }
}
