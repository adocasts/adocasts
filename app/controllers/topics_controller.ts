import CollectionService from '#services/collection_service'
import HistoryService from '#services/history_service'
import PostService from '#services/post_service'
import TaxonomyService from '#services/taxonomy_service'
import { inject } from '@adonisjs/core'
import type { HttpContext } from '@adonisjs/core/http'
import router from '@adonisjs/core/services/router'

@inject()
export default class TopicsController {
  constructor(
    protected taxonomyService: TaxonomyService,
    protected postService: PostService,
    protected collectionService: CollectionService,
    protected historyService: HistoryService
  ) {}

  async index({ view }: HttpContext) {
    const topics = await this.taxonomyService.getList(3)

    return view.render('pages/topics/index', { topics })
  }

  async show({ view, request, params, route }: HttpContext) {
    const { page = '1' } = request.qs()
    const item = await this.taxonomyService.getBySlug(params.slug)

    if (page === '1') {
      const children = await this.taxonomyService.getChildren(item)
      const series = await this.collectionService.getLastUpdated().whereHasTaxonomy(item)
      const snippets = await this.postService.getLatestSnippets().whereHasTaxonomy(item)
      view.share({ children, series, snippets })
    }

    const posts = await this.postService
      .getLatestLessons()
      .whereHasTaxonomy(item)
      .paginate(page, 20, router.makeUrl('topics.show', params))

    await this.historyService.recordView(item, route?.name)

    return view.render('pages/topics/show', { item, posts })
  }
}

