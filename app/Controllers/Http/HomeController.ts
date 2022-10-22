import { HttpContextContract } from '@ioc:Adonis/Core/HttpContext'
import PostService from 'App/Services/PostService'
import CollectionService from 'App/Services/CollectionService'
import TaxonomyService from 'App/Services/TaxonomyService'
import WatchlistService from 'App/Services/WatchlistService'
import HistoryService from 'App/Services/Http/HistoryService'
import HomeVM from 'Contracts/viewModels/HomeVM'
import PostType from 'App/Enums/PostType'
import CacheService from 'App/Services/CacheService'
import CacheKeys from 'App/Enums/CacheKeys'
import AnalyticsService from 'App/Services/AnalyticsService'
import Post from 'App/Models/Post'

export default class HomeController {
  public async index({ view, auth }: HttpContextContract) {
    let vm = new HomeVM()
    let excludeIds: number[] = []

    vm = await CacheService.try(CacheKeys.HOME, async () => {
      const trendingSlugs = await AnalyticsService.getPastMonthsPopularContentSlugs()
      const testLesson = await Post.query().where({ id: 88 }).apply(s => s.forDisplay()).firstOrFail()
      vm.series = await CollectionService.getLastUpdated()
      vm.topics = await TaxonomyService.getList()
      vm.latestLessons = [
        testLesson,
        ...(await PostService.getLatest(6, excludeIds, [PostType.LESSON, PostType.NEWS, PostType.LIVESTREAM, PostType.BLOG]))
      ]
      vm.trendingLessons = await PostService.getBySlugs(trendingSlugs)

      return { ...vm, testLesson }
    })

    if (auth.user) {
      vm.postWatchlist = await WatchlistService.getLatestPosts(auth.user, 3)
      vm.collectionWatchlist = await WatchlistService.getLatestCollections(auth.user, 3)
      vm.collectionProgress = await HistoryService.getLatestSeriesProgress(auth.user, 3)
    }

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
