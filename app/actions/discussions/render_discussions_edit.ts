import BaseAction from '#actions/base_action'
import GetTopicsFilter from '#actions/taxonomies/get_topics_filter'
import Discussion from '#models/discussion'
import { HttpContext } from '@adonisjs/core/http'

export default class RenderDiscussionsEdit extends BaseAction {
  async authorize({ bouncer, params }: HttpContext) {
    const discussion = await Discussion.findByOrFail('slug', params.slug)

    await bouncer.with('DiscussionPolicy').authorize('update', discussion)

    return discussion
  }

  async asController({ view }: HttpContext, _: any, discussion: Discussion) {
    const topics = await GetTopicsFilter.run('discussions')
    const topicOptions = await GetTopicsFilter.run('discussions_form')

    return view.render('pages/discussions/form', { topics, topicOptions, discussion })
  }
}
