import BaseAction from '#core/actions/base_action'
import GetTopicsFilter from '#taxonomy/actions/get_topics_filter'
import { HttpContext } from '@adonisjs/http-server'
import GetDiscussion from './get_discussion.js'

export default class RenderDiscussionsShow extends BaseAction {
  async asController({ view, params }: HttpContext) {
    const discussion = await GetDiscussion.run(params.slug)
    const topics = await GetTopicsFilter.run('discussions')

    return view.render('pages/discussions/show', { discussion, topics })
  }
}
