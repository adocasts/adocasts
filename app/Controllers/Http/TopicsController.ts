import { HttpContextContract } from '@ioc:Adonis/Core/HttpContext'
import Taxonomy from 'App/Models/Taxonomy'
import CollectionTypes from 'App/Enums/CollectionTypes'
import UtilityService from 'App/Services/UtilityService'
import { inject } from '@adonisjs/fold'
import HistoryService from 'App/Services/Http/HistoryService'

@inject([HistoryService])
export default class TopicsController {
  constructor(protected historyService: HistoryService) {}

  public async index({ view }: HttpContextContract) {
    const featuredItems = await Taxonomy.query()
      .apply(scope => scope.hasContent())
      .preload('parent', query => query.preload('asset'))
      .where('isFeatured', true)
      .preload('asset')
      .withCount('posts')
      .withCount('collections')
      .orderBy('name')
      .limit(5)

    const featured = UtilityService.shuffle(featuredItems)

    const topics = await Taxonomy.query()
      .apply(scope => scope.hasContent())
      .preload('parent', query => query.preload('asset'))
      .preload('asset')
      .withCount('posts')
      .withCount('collections')
      .orderBy('name')
    return view.render('topics/index', { featured, topics })
  }

  public async show({ view, params }: HttpContextContract) {
    const topic = await Taxonomy.query()
      .preload('parent')
      .where({ slug: params.slug })
      .firstOrFail()

    const children = await topic.related('children').query()
      .apply(scope => scope.hasContent())
      .preload('parent', query => query.preload('asset'))
      .preload('asset')
      .withCount('posts')
      .withCount('collections')
      .orderBy('name')

    const posts = await topic.related('posts').query().apply(scope => scope.forDisplay())

    const series = await topic.related('collections').query()
      .wherePublic()
      .where('collectionTypeId', CollectionTypes.SERIES)
      .orderBy('name')

    this.historyService.recordTaxonomyView(topic.id)

    return view.render('topics/show', { topic, children, posts, series })
  }
}
