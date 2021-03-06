import { HttpContextContract } from '@ioc:Adonis/Core/HttpContext'
import CommentService from 'App/Services/CommentService'
import Collection from 'App/Models/Collection'
import UtilityService from 'App/Services/UtilityService'
import { inject } from '@adonisjs/fold'
import HistoryService from 'App/Services/Http/HistoryService'

@inject([HistoryService])
export default class SeriesController {
  constructor(protected historyService: HistoryService) {}

  public async index({ view }: HttpContextContract) {
    const featuredItems = await Collection.series()
      .apply(scope => scope.withPostLatestPublished())
      .withCount('postsFlattened', query => query.apply(scope => scope.published()))
      .withAggregate('postsFlattened', query => query.apply(scope => scope.published()).sum('video_seconds').as('videoSecondsSum'))
      .whereHas('postsFlattened', query => query.apply(scope => scope.published()))
      .preload('taxonomies', query => query.groupOrderBy('sort_order', 'asc').groupLimit(3))
      .preload('asset')
      .wherePublic()
      .where('isFeatured', true)
      .whereNull('parentId')
      .orderBy('latest_publish_at', 'desc')
      .select(['collections.*', Collection.postCountSubQuery])
      .limit(4)

    const featured = UtilityService.shuffle(featuredItems)

    const series = await Collection.series()
      .apply(scope => scope.withPostLatestPublished())
      .select(['collections.*'])
      .wherePublic()
      .whereNull('parentId')
      .preload('asset')
      .preload('postsFlattened', query => query
        .apply(scope => scope.forCollectionDisplay({ orderBy: 'pivot_root_sort_order', direction: 'desc' }))
        .groupLimit(3)
      )
      .withCount('postsFlattened', query => query.apply(scope => scope.published()))
      .withAggregate('postsFlattened', query => query.apply(scope => scope.published()).sum('video_seconds').as('videoSecondsSum'))
      .whereHas('postsFlattened', query => query.apply(scope => scope.published()))
      .orderBy('latest_publish_at', 'desc')

    return view.render('series/index', { featured, series })
  }

  public async show({ view, params, auth }: HttpContextContract) {
    const series = await Collection.series()
      .if(auth.user, query => query.withWatchlist(auth.user!.id))
      .apply(scope => scope.withPublishedPostCount())
      .wherePublic()
      .where({ slug: params.slug })
      .whereNull('parentId')
      .preload('asset')
      .preload('postsFlattened', query => query
        .apply(scope => scope.forCollectionDisplay({ orderBy: 'pivot_root_sort_order' }))
        .if(auth.user, query => query.preload('progressionHistory', query => query.where('userId', auth.user!.id)))
      )
      .firstOrFail()

    let nextLesson = auth.user
      ? series.postsFlattened.find(p => !p.progressionHistory.length || p.progressionHistory.some(h => !h.isCompleted))
      : null

    if (!nextLesson) nextLesson = series.postsFlattened[0]

    this.historyService.recordCollectionView(series.id)

    return view.render('series/show', { series, nextLesson })
  }

  public async lesson({ view, params, auth }: HttpContextContract) {
    const series = await Collection.series()
      .where({ slug: params.slug })
      .wherePublic()
      .preload('posts', query => query.apply(scope => scope.forCollectionDisplay()))
      .preload('children', query => query
        .wherePublic()
        .preload('posts', query => query
          .apply(scope => scope.forCollectionDisplay())
          .if(auth.user, query => query.preload('progressionHistory', query => query.where('userId', auth.user!.id)))
        )
      )
      .firstOrFail()

    const post = await series.related('postsFlattened').query()
      .if(auth.user, query => query.withWatchlist(auth.user?.id))
      .where("root_sort_order", params.index - 1)
      .apply(scope => scope.forDisplay())
      .highlightOrFail()

    const comments = await CommentService.getForPost(post)

    this.historyService.recordPostView(post.id)
    const userProgression = await this.historyService.getPostProgression(post)

    return view.render('series/lesson', { post, series, comments, userProgression })
  }
}
