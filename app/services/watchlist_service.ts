import Watchlist from '#models/watchlist'
import { inject } from '@adonisjs/core'
import { HttpContext } from '@adonisjs/core/http'
import States from '#enums/states'
import UnauthorizedException from '#exceptions/unauthorized_exception'
import User from '#models/user'

@inject()
export default class WatchlistService {
  constructor(protected ctx: HttpContext) {}

  private get user() {
    return this.ctx.auth.user
  }

  /**
   * returns latest watchlist posts for user
   * @param limit 
   * @param excludeIds 
   * @returns 
   */
  public async getLatestPosts(limit: number | undefined = undefined, excludeIds: number[] = []) {
    if (!this.user) return []

    const results = await this.user.related('watchlist').query()
      .whereNotNull('postId')
      .if(excludeIds.length, query => query.whereNotIn('postId', excludeIds))
      .preload('post', query => query.apply(scope => scope.forDisplay()))
      .orderBy('createdAt', 'desc')
      .if(limit, query => query.limit(limit!))

    return results.map(r => r.post)
  }

  /**
   * returns latest watchlsit collections for user
   * @param limit 
   * @param excludeIds 
   * @returns 
   */
  public async getLatestCollections(limit: number | undefined = undefined, excludeIds: number[] = []) {
    if (!this.user) return []

    const results = await this.user.related('watchlist').query()
      .whereNotNull('collectionId')
      .if(excludeIds.length, query => query.whereNotIn('collectionId', excludeIds))
      .preload('collection', query => query
        .preload('asset')
        .preload('postsFlattened', query => query.apply(scope => scope.forDisplay()).groupLimit(3))
        .withCount('postsFlattened', query => query.apply(scope => scope.published()))
        .withAggregate('postsFlattened', query => query.apply(scope => scope.published()).sum('video_seconds').as('videoSecondsSum'))
        .where('stateId', States.PUBLIC)
      )
      .orderBy('createdAt', 'desc')
      .if(limit, query => query.limit(limit!))

    return results.map(r => r.collection)
  }

  /**
   * toggles watchlist item for user
   * @param data 
   * @returns 
   */
  public async toggle(data: Partial<Watchlist>) {
    return WatchlistService.toggle(this.user, data)
  }

  public static async toggle(user: User | undefined, data: Partial<Watchlist>) {
    if (!user) throw new UnauthorizedException('Watchlists require an authenticated user')

    const record = await Watchlist.query().where(data).where({ userId: user.id }).first()

    const watchlist = record
      ? await record.delete()
      : await Watchlist.create({ ...data, userId: user.id })

    return { watchlist, wasDeleted: !!record }
  }
}
