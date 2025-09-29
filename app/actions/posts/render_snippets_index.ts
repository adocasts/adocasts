import BaseAction from '#actions/base_action'
import GetTopicsFilter from '#actions/taxonomies/get_topics_filter'
import { postSearchValidator } from '#validators/post'
import { HttpContext } from '@adonisjs/core/http'
import { Infer } from '@vinejs/vine/types'
import GetSnippetsPaginated from './get_snippets_paginated.js'

export default class RenderSnippetsIndex extends BaseAction {
  validator = postSearchValidator

  async asController({ view }: HttpContext, filters: Infer<typeof this.validator>) {
    const snippets = await GetSnippetsPaginated.run(filters, 'snippets.index')
    const topics = await GetTopicsFilter.run('snippets')

    return view.render('pages/snippets/index', { snippets, topics, filters })
  }
}
