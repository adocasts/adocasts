import PostService from '#services/post_service';
import { inject } from '@adonisjs/core';
import type { HttpContext } from '@adonisjs/core/http'
import router from '@adonisjs/core/services/router'

@inject()
export default class BlogsController {
  constructor(protected postService: PostService) {}
  
  async index({ view, request, params }: HttpContext) {
    const { page = 1, sortBy = 'publishAt', sort = 'desc' } = request.qs()

    const items = await this.postService
      .getBlogs()
      .orderBy(sortBy, sort)
      .paginate(page, 20, router.makeUrl('blog.index', params))

    return view.render('pages/blogs/index', { items })
  }
  
  async show({}: HttpContext) {}
  
}