import BaseAction from '#actions/base_action'
import GetTopicsFilter from '#actions/taxonomies/get_topics_filter'
import { postSearchValidator } from '#validators/post'
import { HttpContext } from '@adonisjs/core/http'
import { Infer } from '@vinejs/vine/types'
import GetStreamsPaginated from './get_streams_paginated.js'

export default class RenderStreamsIndex extends BaseAction {
  validator = postSearchValidator

  async asController({ view }: HttpContext, filters: Infer<typeof this.validator>) {
    const lessons = await GetStreamsPaginated.run(filters, 'streams.index')
    const topics = await GetTopicsFilter.run('streams')

    return view.render('pages/streams/index', { lessons, topics, filters })
  }
}
