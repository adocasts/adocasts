import BaseAction from '#core/actions/base_action'
import { discussionSearchValidator } from '#discussion/validators/discussion'
import { HttpContext } from '@adonisjs/core/http'
import { Infer } from '@vinejs/vine/types'
import GetDiscussionsPaginated from './get_discussions_paginated.js'
import GetTopicsFilter from '#taxonomy/actions/get_topics_filter'

export default class RenderDiscussionsIndex extends BaseAction {
  validator = discussionSearchValidator

  async asController({ view }: HttpContext, filters: Infer<typeof this.validator>) {
    const discussions = await GetDiscussionsPaginated.run(filters)
    const topics = await GetTopicsFilter.run('discussions')

    return view.render('pages/discussions/index', { discussions, topics, filters })
  }
}
