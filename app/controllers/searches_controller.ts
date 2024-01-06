import CollectionService from '#services/collection_service'
import PostService from '#services/post_service'
import TaxonomyService from '#services/taxonomy_service'
import { inject } from '@adonisjs/core'
import type { HttpContext } from '@adonisjs/core/http'
import router from '@adonisjs/core/services/router'

@inject()
export default class SearchesController {
  constructor(
    protected postService: PostService,
    protected collectionService: CollectionService,
    protected taxonomyService: TaxonomyService
  ) {}

  async index({ view, request }: HttpContext) {
    const pattern = request.input('pattern')
    const posts = await this.postService.search(pattern)
    const series = await this.collectionService.search(pattern)
    const topics = await this.taxonomyService.search(pattern)

    return view.render('pages/search/index', {
      pattern,
      posts,
      series,
      topics,
    })
  }

  async search({ view, request, response }: HttpContext) {
    const pattern = await request.input('pattern')
    const posts = await this.postService.search(pattern)
    const series = await this.collectionService.search(pattern)
    const topics = await this.taxonomyService.search(pattern)
    const newPath = router.makeUrl('search.index', {}, { qs: { pattern } })

    response.header('X-Up-Location', newPath)

    return view.render('components/search/results', {
      pattern,
      posts,
      series,
      topics,
    })
  }
}

