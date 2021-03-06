import { HttpContextContract } from '@ioc:Adonis/Core/HttpContext'
import PostService from 'App/Services/PostService'
import CollectionService from 'App/Services/CollectionService'
import TaxonomyService from 'App/Services/TaxonomyService'
import WatchlistService from 'App/Services/WatchlistService'
import HistoryService from 'App/Services/Http/HistoryService'
import HomeVM from 'Contracts/viewModels/HomeVM'

export default class HomeController {
  public async index({ view, auth }: HttpContextContract) {
    const vm = new HomeVM()
    const excludeIds: number[] = []

    if (auth.user) {
      vm.postWatchlist = await WatchlistService.getLatestPosts(auth.user)
      vm.collectionWatchlist = await WatchlistService.getLatestCollections(auth.user)
      vm.collectionProgress = await HistoryService.getLatestSeriesProgress(auth.user)
    }

    vm.featuredLesson = await PostService.getFeatureSingle()
    vm.featuredLesson && excludeIds.push(vm.featuredLesson.id)
    vm.series = await CollectionService.getLastUpdated()
    vm.topics = await TaxonomyService.getLastUpdated()
    vm.latestLessons = await PostService.getLatest(10, excludeIds)

    return view.render('index', vm)
  }

  public async search({ request, view }: HttpContextContract) {
    const term = request.input('term')
    const posts = await PostService.search(term)
    const series = await CollectionService.search(term)
    const topics = await TaxonomyService.search(term)

    return view.render('search', { term, posts, series, topics })
  }
}
