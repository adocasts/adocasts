import BaseAction from '#core/actions/base_action'
import DiscussionViewTypes from '#discussion/enums/discussion_view_types'
import GetTopicsFilter from '#taxonomy/actions/get_topics_filter'
import { HttpContext } from '@adonisjs/http-server'
import GetDiscussion from './get_discussion.js'
import StoreDiscussionView from './store_discussion_view.js'

export default class RenderDiscussionsShow extends BaseAction {
  async asController({ view, params, request, auth }: HttpContext) {
    const discussion = await GetDiscussion.run(params.slug)
    const topics = await GetTopicsFilter.run('discussions')

    await StoreDiscussionView.run({ request, auth }, DiscussionViewTypes.VIEW, discussion.id)

    discussion.meta.views_count++

    return view.render('pages/discussions/show', { discussion, topics })
  }
}
