import Plans from '#enums/plans'
import Plan from '#models/plan'
import CollectionService from '#services/collection_service'
import IdentityService from '#services/identity_service'
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
    const series = await this.collectionService.getLastUpdated(7, true)
    const topics = await this.taxonomyService.getList()
    const lessons = await this.postService.getLatestLessons(12)
    const blogs = await this.postService.getLatestBlogs(3)
    const snippets = await this.postService.getLatestSnippets(3)

    if (!auth.user || auth.user.isFreeTier) {
      const plusMonthly = await Plan.findOrFail(Plans.PLUS_MONTHLY)
      const plusAnnual = await Plan.findOrFail(Plans.PLUS_ANNUAL)
      const plusForever = await Plan.findOrFail(Plans.FOREVER)

      view.share({ plusMonthly, plusAnnual, plusForever })
    }

    return view.render('pages/home', {
      series,
      topics,
      lessons,
      blogs,
      snippets,
    })
  }

  async pricing({ view }: HttpContext) {
    const plusMonthly = await Plan.findOrFail(Plans.PLUS_MONTHLY)
    const plusAnnual = await Plan.findOrFail(Plans.PLUS_ANNUAL)
    const plusForever = await Plan.findOrFail(Plans.FOREVER)

    view.share({ plusMonthly, plusAnnual, plusForever, isPricingPage: true })

    return view.render('pages/pricing')
  }
}
