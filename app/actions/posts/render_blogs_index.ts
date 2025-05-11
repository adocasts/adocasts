import BaseAction from '#actions/base_action'
import GetTopicsFilter from '#actions/taxonomies/get_topics_filter'
import { postSearchValidator } from '#validators/post'
import { HttpContext } from '@adonisjs/core/http'
import { Infer } from '@vinejs/vine/types'
import GetBlogsPaginated from './get_blogs_paginated.js'

export default class RenderBlogsIndex extends BaseAction {
  validator = postSearchValidator

  async asController({ view }: HttpContext, filters: Infer<typeof this.validator>) {
    const blogs = await GetBlogsPaginated.run(filters, 'blogs.index')
    const topics = await GetTopicsFilter.run('posts')

    return view.render('pages/blogs/index', { blogs, topics })
  }
}
