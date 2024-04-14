import User from '#models/user'
import History from '#models/history'
import HistoryTypes from '#enums/history_types'
import Post from '#models/post'
import Collection from '#models/collection'
import Taxonomy from '#models/taxonomy'
import NotImplementedException from '#exceptions/not_implemented_exception'
import States from '#enums/states'
import db from '@adonisjs/lucid/services/db'
import { HttpContext } from '@adonisjs/core/http'
import { inject } from '@adonisjs/core'
import { SeriesShowVM } from '../view_models/series.js'

@inject()
export default class HistoryService {
  constructor(protected ctx: HttpContext) {}

  get user() {
    return this.ctx.auth.user
  }

  /**
   * returns user's progression history for provided post
   * @param auth
   * @param post
   * @returns
   */
  async getPostProgression(post: Post) {
    return HistoryService.getPostProgression(this.user, post)
  }

  static async getPostProgression(user: User | undefined, post: Post) {
    if (!user) return
    return post
      .related('progressionHistory')
      .query()
      .where('userId', user!.id)
      .orderBy('updatedAt', 'desc')
      .first()
  }

  /**
   * records a view to the user's history for the provided record
   * @param user
   * @param record
   * @param routeName
   * @returns
   */
  async recordView(
    record: Post | Collection | Taxonomy | SeriesShowVM,
    routeName: string | undefined = undefined
  ) {
    if (!this.user) return

    const idColumn = this.getRecordRelationColumn(record)

    return History.create({
      userId: this.user.id,
      route: routeName,
      historyTypeId: HistoryTypes.VIEW,
      [idColumn]: record.id,
    })
  }

  /**
   * returns the History column name for the provided relation record
   * @param record
   * @returns
   */
  getRecordRelationColumn(record: Post | Collection | Taxonomy | SeriesShowVM) {
    switch (true) {
      case record instanceof Post:
        return 'postId'
      case record instanceof Collection:
      case record instanceof SeriesShowVM:
        return 'collectionId'
      case record instanceof Taxonomy:
        return 'taxonomyId'
      default:
        throw new NotImplementedException(
          `HistoryService.recordView has not yet implemented support for record of type: ${record}`
        )
    }
  }

  async getLatestSeriesProgress(limit: number | undefined = undefined) {
    const collectionResults = await History.query()
      .where('historyTypeId', HistoryTypes.PROGRESSION)
      .where('userId', this.user!.id)
      .whereNotNull('collectionId')
      .orderBy('updatedAt', 'desc')
      .select('collectionId')

    const collectionIds = collectionResults.map((r) => r.collectionId)

    let distinctCollectionIds = [...new Set(collectionIds)]

    if (limit) {
      distinctCollectionIds = distinctCollectionIds.slice(0, limit)
    }

    const collections = await Collection.query()
      .preload('asset')
      .whereIn('id', distinctCollectionIds as number[])
      .withCount('postsFlattened', (query) =>
        query.apply((scope) => scope.published()).as('postCount')
      )
      .withCount('progressionHistory', (query) =>
        query.where('userId', this.user!.id).where('isCompleted', true).as('postCompletedCount')
      )
      .preload('postsFlattened', (query) =>
        query
          .preload('assets')
          .preload('series', (series) => series.where('stateId', States.PUBLIC).groupLimit(1))
          .preload('progressionHistory', (history) =>
            history.where('userId', this.user!.id).orderBy('updatedAt', 'desc').groupLimit(1)
          )
          .whereDoesntHave('progressionHistory', (history) =>
            history.where('userId', this.user!.id).where('isCompleted', true)
          )
          .groupOrderBy('root_sort_order', 'asc')
          .groupLimit(1)
      )

    return collections
      .reduce((arr, item) => {
        arr[distinctCollectionIds.indexOf(item.id)] = item
        return arr
      }, [] as Collection[])
      .filter(Boolean)
  }

  async getLatestPostProgress(limit: number | undefined = undefined) {
    const subQuery = db
      .knexQuery()
      .from('histories')
      .select(db.knexRawQuery('MAX(updated_at) as updated_at'), 'post_id', 'user_id')
      .where('history_type_id', HistoryTypes.PROGRESSION)
      .groupBy('post_id', 'user_id')
      .as('h2')

    const latestHistoryPerPost = await db
      .knexQuery()
      .from('histories as h1')
      .innerJoin(subQuery, (query) =>
        query
          .on('h1.user_id', 'h2.user_id')
          .andOn('h1.post_id', 'h2.post_id')
          .andOn('h1.updated_at', 'h2.updated_at')
      )
      .where('h1.user_id', this.user!.id)
      .where('h1.history_type_id', HistoryTypes.PROGRESSION)
      .whereNotNull('h1.post_id')
      .where((query) =>
        query
          .where('h1.is_completed', true)
          .orWhere((or) => or.whereNotNull('h1.watch_percent').where('h1.watch_percent', '>', 0))
          .orWhere((or) => or.whereNotNull('h1.read_percent').where('h1.read_percent', '>', 0))
      )
      .select('h1.id', 'h1.post_id', 'h1.updated_at')
      .orderBy('h1.updated_at', 'desc')

    let distinctPostIds = [...new Set(latestHistoryPerPost.map((h: any) => h.post_id))] as number[]
    let distinctHistoryIds = [...new Set(latestHistoryPerPost.map((h: any) => h.id))] as number[]

    if (limit) {
      distinctPostIds = distinctPostIds.slice(0, limit)
    }

    const posts = await Post.query()
      .whereIn('id', distinctPostIds)
      .apply((scope) => scope.forDisplay())
      .whereHas('progressionHistory', (query) => query.whereIn('id', distinctHistoryIds))
      .preload('progressionHistory', (query) =>
        query.whereIn('id', distinctHistoryIds).orderBy('updatedAt', 'desc').groupLimit(1)
      )

    return posts
      .reduce((arr, item) => {
        arr[distinctPostIds.indexOf(item.id)] = item
        return arr
      }, [] as Post[])
      .filter(Boolean)
  }
}
