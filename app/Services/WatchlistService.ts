import Watchlist from 'App/Models/Watchlist'
import User from 'App/Models/User'
import WatchlistValidator from 'App/Validators/WatchlistValidator'

export default class WatchlistService {
  /**
   * returns latest watchlist posts for user
   * @param user 
   * @param limit 
   * @param excludeIds 
   * @returns 
   */
  public static async getLatestPosts(user: User|undefined, limit: number = 3, excludeIds: number[] = []) {
    if (!user) return []

    const results = await user.related('watchlist').query()
      .whereNotNull('postId')
      .if(excludeIds.length, query => query.whereNotIn('postId', excludeIds))
      .preload('post', query => query.apply(scope => scope.forDisplay()))
      .orderBy('createdAt', 'desc')
      .if(limit, query => query.limit(limit))

    return results.map(r => r.post)
  }

  /**
   * returns latest watchlsit collections for user
   * @param user 
   * @param limit 
   * @param excludeIds 
   * @returns 
   */
  public static async getLatestCollections(user: User|undefined, limit: number = 3, excludeIds: number[] = []) {
    if (!user) return []

    const results = await user.related('watchlist').query()
      .whereNotNull('collectionId')
      .if(excludeIds.length, query => query.whereNotIn('collectionId', excludeIds))
      .preload('collection', query => query
        .preload('asset')
        .withCount('postsFlattened', query => query.apply(scope => scope.published()))
        .withAggregate('postsFlattened', query => query.apply(scope => scope.published()).sum('video_seconds').as('videoSecondsSum'))
        .wherePublic()
      )
      .orderBy('createdAt', 'desc')
      .if(limit, query => query.limit(limit))

    return results.map(r => r.collection)
  }

  /**
   * toggles watchlist item for user
   * @param user 
   * @param data 
   * @returns 
   */
  public static async toggle(user: User, data: WatchlistValidator['schema']['props']) {
    const record = await Watchlist.query().where(data).where({ userId: user.id }).first()

    const watchlist = record
      ? await record.delete()
      : await Watchlist.create({ ...data, userId: user.id })

    return [watchlist, !!record]
  }
}
