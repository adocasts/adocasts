import CollectionService from '#services/collection_service'
import PlanService from '#services/plan_service'
import PostService from '#services/post_service'
import TaxonomyService from '#services/taxonomy_service'
import { inject } from '@adonisjs/core'
import type { HttpContext } from '@adonisjs/core/http'

@inject()
export default class HomeController {
  constructor(
    protected collectionService: CollectionService,
    protected taxonomyService: TaxonomyService,
    protected postService: PostService
  ) {}

  /**
   * Display a list of resource
   */
  async index({ view, auth, history }: HttpContext) {
    const series = await this.collectionService.getRecentlyUpdated()
    const lessons = await this.postService.getCachedLatestLessons()
    const topics = await this.taxonomyService.getDisplayList()
    const blogs = await this.postService.getCachedLatestBlogs()
    const snippets = await this.postService.getCachedLatestSnippets()

    if (!auth.user || auth.user.isFreeTier) {
      const plans = await PlanService.all()
      view.share(plans)
    }

    await history.commit()

    return view.render('pages/home', {
      series,
      topics,
      lessons,
      blogs,
      snippets,
    })
  }

  async pricing({ view }: HttpContext) {
    const plans = await PlanService.all()

    view.share({ ...plans, isPricingPage: true })

    return view.render('pages/pricing')
  }
}
