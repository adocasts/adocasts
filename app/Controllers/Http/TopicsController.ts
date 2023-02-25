import type { HttpContextContract } from '@ioc:Adonis/Core/HttpContext'
import TaxonomyService from 'App/Services/TaxonomyService'

export default class TopicsController {
  public async index({ view }: HttpContextContract) {
    const topics = await TaxonomyService.getList(3)

    return view.render('pages/topics/index', { topics })
  }

  public async show({ params, view }: HttpContextContract) {
    const topic = await TaxonomyService.getBySlug(params.slug)
    const children = await TaxonomyService.getChildren(topic)
    const posts = await TaxonomyService.getPosts(topic)
    const series = await TaxonomyService.getCollections(topic)

    return view.render('pages/topics/show', { topic, children, posts, series })
  }
}
