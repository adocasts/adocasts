import { HttpContextContract } from '@ioc:Adonis/Core/HttpContext'
import CommentService from 'App/Services/CommentService'
import Collection from 'App/Models/Collection'
import { inject } from '@adonisjs/fold'
import HistoryService from 'App/Services/Http/HistoryService'
import CacheService from 'App/Services/CacheService'
import CacheKeys from 'App/Enums/CacheKeys'
import CollectionService from 'App/Services/CollectionService'

@inject([HistoryService])
export default class SeriesController {
  constructor(protected historyService: HistoryService) {}

  public async index({ view }: HttpContextContract) {
    const { featuredItem, series } = await CacheService.try(CacheKeys.SERIES, async () => {
      let featuredItem = await CollectionService.getFeaturedSeries()

      if (!featuredItem) {
        featuredItem = (await CollectionService.getLastUpdated(1, [], true, 5))[0]
      }

      const series = await Collection.series()
        .apply(scope => scope.withPostLatestPublished())
        .if(featuredItem, query => query.whereNotIn('id', [featuredItem!.id]))
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

      return { featuredItem, series }
    })

    return view.render('series/index', { featured: featuredItem, series })
  }

  public async show({ view, params, auth }: HttpContextContract) {
    const series = await Collection.series()
      .if(auth.user, query => query.withWatchlist(auth.user!.id))
      .apply(scope => scope.withPublishedPostCount())
      .apply(scope => scope.withPublishedPostDuration())
      .wherePublic()
      .where({ slug: params.slug })
      .whereNull('parentId')
      .preload('asset')
      .preload('postsFlattened', query => query
        .apply(scope => scope.forCollectionDisplay({ orderBy: 'pivot_root_sort_order' }))
        .if(auth.user, query => query.preload('progressionHistory', query => query.where('userId', auth.user!.id)))
      )
      .preload('updatedVersions', query => query
        .wherePublic()
        .whereHas('postsFlattened', query => query.apply(s => s.published()))
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
      .preload('updatedVersions', query => query
        .wherePublic()
        .whereHas('postsFlattened', query => query.apply(s => s.published()))
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
