import { HttpContextContract } from '@ioc:Adonis/Core/HttpContext'
import Collection from 'App/Models/Collection'
import Taxonomy from 'App/Models/Taxonomy'

export default class SyndicationController {
  public async sitemap({ view }: HttpContextContract) {
    const series = await Collection.series()
      .preload('children')
      .wherePublic()
      .orderBy('name', 'asc')

    const topics = await Taxonomy.roots()
      .preload('children')
      .orderBy('name', 'asc')

    return view.render('sitemap', { series, topics })
  }
}
