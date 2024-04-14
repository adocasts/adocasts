import AdService from '#services/ad_service'
import DiscussionService from '#services/discussion_service'
import PostService from '#services/post_service'
import { inject } from '@adonisjs/core'
import type { HttpContext } from '@adonisjs/core/http'
import router from '@adonisjs/core/services/router'
import { PostListVM } from '../view_models/post.js'

@inject()
export default class SnippetsController {
  constructor(
    protected postService: PostService,
    protected discussionService: DiscussionService
  ) {}

  async index({ view, request, params }: HttpContext) {
    const { page = 1, sortBy = 'publishAt', sort = 'desc' } = request.qs()

    const items = await this.postService
      .getSnippets()
      .orderBy(sortBy, sort)
      .paginate(page, 20, router.makeUrl('blog.index', params))

    const rows = items.map(post => new PostListVM(post))
    const adAside = await AdService.getMediumRectangles()
    const feed = await this.discussionService.getAsideList(Math.ceil(items.length / 2))

    return view.render('pages/snippets/index', { items, rows, feed, adAside })
  }

  async show({}: HttpContext) {}
}

