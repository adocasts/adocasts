import Watchlist from 'App/Models/Watchlist'
import User from 'App/Models/User'

export default class WatchlistService {
  public static async getLatestPosts(user: User|undefined, limit: number = 3, excludeIds: number[] = []) {
    if (!user) return []

    const results = await user.related('watchlist').query()
      .whereNotNull('postId')
      .if(excludeIds.length, query => query.whereNotIn('postId', excludeIds))
      .preload('post', query => query.apply(scope => scope.forDisplay()))
      .orderBy('createdAt', 'desc')
      .limit(limit)

    return results.map(r => r.post)
  }

  public static async getLatestCollections(user: User|undefined, limit: number = 3, excludeIds: number[] = []) {
    if (!user) return []

    const results = await user.related('watchlist').query()
      .whereNotNull('collectionId')
      .if(excludeIds.length, query => query.whereNotIn('collectionId', excludeIds))
      .preload('collection', query => query
        .withCount('postsFlattened', query => query.apply(scope => scope.published()))
        .wherePublic()
      )
      .orderBy('createdAt', 'desc')
      .limit(limit)

    return results.map(r => r.collection)
  }

  public static async toggle(userId: number, data: { [x: string]: any }) {
    const record = await Watchlist.query().where(data).where({ userId }).first()

    const watchlist = record
      ? await record.delete()
      : await Watchlist.create({ ...data, userId })

    return [watchlist, !!record]
  }
}
