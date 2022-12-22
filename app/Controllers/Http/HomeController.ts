import { HttpContextContract } from '@ioc:Adonis/Core/HttpContext'
import PostService from 'App/Services/PostService'
import CollectionService from 'App/Services/CollectionService'
import TaxonomyService from 'App/Services/TaxonomyService'
import PostType from 'App/Enums/PostType'
import CacheService from 'App/Services/CacheService'
import CacheKeys from 'App/Enums/CacheKeys'
import AnalyticsService from 'App/Services/AnalyticsService'

export default class HomeController {
  public async index({ view }: HttpContextContract) {
    let excludeIds: number[] = []
    const homePostTypes = [PostType.LESSON, PostType.NEWS, PostType.LIVESTREAM, PostType.BLOG]
    
    const vm = await CacheService.try(CacheKeys.HOME, async () => {
      const trendingSlugs = await AnalyticsService.getPastMonthsPopularContentSlugs()
      const seriesFeature = await CollectionService.getLastUpdated(1, [], true, 5)
      const series = await CollectionService.getLastUpdated(4, [], false)
      const topics = await TaxonomyService.getList()
      const latestHero = await PostService.getFeatureSingle(excludeIds)

      excludeIds = [latestHero!.id]

      const latestOne = await PostService.getLatest(4, excludeIds, homePostTypes)

      excludeIds = [...excludeIds, ...latestOne.map(l => l.id)]

      const latestTwo = await PostService.getLatest(8, excludeIds, homePostTypes)

      excludeIds = [...excludeIds, ...latestTwo.map(l => l.id)]

      const latestThree = await PostService.getLatest(8, excludeIds, homePostTypes)
      const trendingLessons = await PostService.getBySlugs(trendingSlugs)

      return { 
        seriesFeature,
        series, 
        topics, 
        latestHero,
        latestOne,
        latestTwo, 
        latestThree,
        trendingLessons 
      }
    })

    return view.render('index', vm)
  }

  public async analytics({ view }: HttpContextContract) {
    return view.render('analytics')
  }

  public async search({ request, view }: HttpContextContract) {
    const term = request.input('term')
    const posts = await PostService.search(term)
    const series = await CollectionService.search(term)
    const topics = await TaxonomyService.search(term)

    return view.render('search', { term, posts, series, topics })
  }
}
