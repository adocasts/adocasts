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
  async index({ view, auth }: HttpContext) {
    const seriesFeature = await this.collectionService.getLatestFeatureForHome()
    const seriesLatest = await this.collectionService.getLatestForHome()
    const lessons = await this.postService.getLatestLessonsForHome()
    const topics = await this.taxonomyService.getDisplayList()
    const blogs = await this.postService.getLatestBlogsForHome()
    const snippets = await this.postService.getLatestSnippetsForHome()

    if (!auth.user || auth.user.isFreeTier) {
      const plans = await PlanService.all()
      view.share(plans)
    }

    return view.render('pages/home', {
      seriesFeature,
      seriesLatest,
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
