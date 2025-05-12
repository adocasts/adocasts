import BaseAction from '#actions/base_action'
import GetTopicsFilter from '#actions/taxonomies/get_topics_filter'
import { HttpContext } from '@adonisjs/core/http'

export default class RenderDiscussionsCreate extends BaseAction {
  async authorize({ bouncer }: HttpContext) {
    await bouncer.with('DiscussionPolicy').authorize('store')
  }

  async asController({ view }: HttpContext) {
    const topics = await GetTopicsFilter.run('discussions')

    return view.render('pages/discussions/form', { topics })
  }
}
