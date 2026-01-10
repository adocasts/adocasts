import BaseAction from '#actions/base_action'
import GetSeriesList from '#actions/collections/get_series_list'
import GetTopicList from '#actions/taxonomies/get_topic_list'
import { HttpContext } from '@adonisjs/http-server'

export default class RenderSitemap extends BaseAction {
  async asController({ view }: HttpContext) {
    const series = await GetSeriesList.run()
    const topics = await GetTopicList.run()

    return view.render('pages/sitemap', { series, topics })
  }
}
