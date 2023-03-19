import type { HttpContextContract } from '@ioc:Adonis/Core/HttpContext'
import HistoryService from 'App/Services/HistoryService'
import TaxonomyService from 'App/Services/TaxonomyService'

export default class TopicsController {
  public async index({ view }: HttpContextContract) {
    const topics = await TaxonomyService.getList(3)

    return view.render('pages/topics/index', { topics })
  }

  public async show({ params, view, auth, route }: HttpContextContract) {
    const topic = await TaxonomyService.getBySlug(params.slug)
    const children = await TaxonomyService.getChildren(topic)
    const posts = await TaxonomyService.getPosts(topic)
    const series = await TaxonomyService.getCollections(topic)

    await HistoryService.recordView(auth.user, topic, route?.name)

    return view.render('pages/topics/show', { topic, children, posts, series })
  }
}
