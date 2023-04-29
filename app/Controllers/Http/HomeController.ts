import type { HttpContextContract } from '@ioc:Adonis/Core/HttpContext'
import CollectionService from 'App/Services/CollectionService'
import PostService from 'App/Services/PostService'
import TaxonomyService from 'App/Services/TaxonomyService'
import Post from "App/Models/Post";
import Collection from "App/Models/Collection";
import Taxonomy from "App/Models/Taxonomy";

export default class HomeController {
  /**
   * Displays home page
   * @param param0
   * @returns
   */
  public async index({ view, response }: HttpContextContract) {
    const trending = await PostService.getTrending(15)
    const posts = await PostService.getLatest(13)
    const series = await CollectionService.getLastUpdated(4, false)
    const topics = await TaxonomyService.getList()

    const postCount = await Post.query().apply(s => s.published()).getCount()
    const postSeconds = await Post.query().sum('video_seconds').first()
    const seriesCount = await Collection.series().wherePublic().getCount()
    const topicCount = await Taxonomy.query().getCount()

    const stats = {
      postCount,
      postSeconds,
      seriesCount,
      topicCount
    }

    return view.render('pages/index', { trending, posts, series, topics, stats })
  }
}
