import CollectionService from '#services/collection_service'
import DiscussionService from '#services/discussion_service'
import HistoryService from '#services/history_service'
import PostService from '#services/post_service'
import TaxonomyService from '#services/taxonomy_service'
import { inject } from '@adonisjs/core'
import { Exception } from '@adonisjs/core/exceptions'
import type { HttpContext } from '@adonisjs/core/http'
import router from '@adonisjs/core/services/router'
import { PostListVM } from '../view_models/post.js'

@inject()
export default class TopicsController {
  constructor(
    protected taxonomyService: TaxonomyService,
    protected postService: PostService,
    protected collectionService: CollectionService,
    protected historyService: HistoryService,
    protected discussionService: DiscussionService
  ) {}

  async index({ view, history }: HttpContext) {
    const topics = await this.taxonomyService.getCachedList()

    await history.commit()

    return view.render('pages/topics/index', { topics })
  }

  async show({ view, request, params, route, history }: HttpContext) {
    const { page = '1' } = request.qs()
    const topics = await this.taxonomyService.getCachedList()
    const item = topics.find(topic => topic.slug === params.slug)

    if (!item) {
      throw new Exception(`No topic found with slug ${params.slug}`, {
        code: 'E_NOT_FOUND',
        status: 404,
      })
    }

    let childIds: number[] = []

    if (page === '1') {
      const children = topics.filter(topic => topic.parentId === item.id)
      const series = await this.collectionService.getCachedForTaxonomy(item)
      const snippets = await this.postService.getCachedSnippetsForTaxonomy(item)

      childIds = children.map((child) => child.id)

      view.share({ children, series, snippets })
    }

    const posts = await this.postService
      .getLatestLessons()
      .whereHasTaxonomy(item)
      .paginate(page, 20, router.makeUrl('topics.show', params))

    const rows = posts.map(post => new PostListVM(post))
    const taxonomyIds = [item.id, ...childIds]
    const feed = await this.discussionService.getAsideList(5, taxonomyIds)

    await this.historyService.recordView(item, route?.name)
    await history.commit()

    return view.render('pages/topics/show', { item, rows, posts, feed })
  }
}
