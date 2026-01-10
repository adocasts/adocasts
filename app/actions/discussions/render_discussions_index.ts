import BaseAction from '#actions/base_action'
import GetTopicsFilter from '#actions/taxonomies/get_topics_filter'
import { discussionSearchValidator } from '#validators/discussion'
import { HttpContext } from '@adonisjs/core/http'
import { Infer } from '@vinejs/vine/types'
import GetDiscussionsPaginated from './get_discussions_paginated.js'

export default class RenderDiscussionsIndex extends BaseAction {
  validator = discussionSearchValidator

  async asController({ view }: HttpContext, filters: Infer<typeof this.validator>) {
    const discussions = await GetDiscussionsPaginated.run(filters, 'discussions.index')
    const topics = await GetTopicsFilter.run('discussions')

    return view.render('pages/discussions/index', { discussions, topics, filters })
  }
}
