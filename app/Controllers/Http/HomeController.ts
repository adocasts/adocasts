import type { HttpContextContract } from '@ioc:Adonis/Core/HttpContext'
import CollectionService from 'App/Services/CollectionService'
import PostService from 'App/Services/PostService'
import TaxonomyService from 'App/Services/TaxonomyService'

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
    
    return view.render('pages/index', { trending, posts, series, topics })
  }
}
