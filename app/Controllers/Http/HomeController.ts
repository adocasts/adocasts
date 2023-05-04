import type { HttpContextContract } from '@ioc:Adonis/Core/HttpContext'
import CollectionService from 'App/Services/CollectionService'
import PostService from 'App/Services/PostService'
import TaxonomyService from 'App/Services/TaxonomyService'
import Post from "App/Models/Post";
import Collection from "App/Models/Collection";
import Taxonomy from "App/Models/Taxonomy";
import HistoryService from 'App/Services/HistoryService';

export default class HomeController {
  /**
   * Displays home page
   * @param param0
   * @returns
   */
  public async index({ view, auth }: HttpContextContract) {
    const trending = await PostService.getTrending(15)
    const posts = await PostService.getLatest(auth.user ? 21 : 16)
    const series = await CollectionService.getLastUpdated(4, false)
    const topics = await TaxonomyService.getList()

    const postCount = await Post.query().apply(s => s.published()).getCount()
    const postSeconds = await Post.query().sum('video_seconds').first()
    const seriesCount = await Collection.series().wherePublic().getCount()
    const topicCount = await Taxonomy.query().getCount()

    if (auth.user) {
      view.share({ 
        inProgressPosts: await HistoryService.getLatestPostProgress(auth.user!, 8),
        inProgressCollections: await HistoryService.getLatestSeriesProgress(auth.user!, 4)
      })
    }

    const stats = {
      postCount,
      postSeconds,
      seriesCount,
      topicCount
    }

    return view.render('pages/index', { trending, posts, series, topics, stats })
  }

  public async analytics({ view }: HttpContextContract) {
    return view.render('pages/analytics')
  }
}
