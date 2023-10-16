import { AuthContract } from "@ioc:Adonis/Addons/Auth";
import { ModelQueryBuilderContract } from "@ioc:Adonis/Lucid/Orm";
import Collection from "App/Models/Collection";
import Post from "App/Models/Post";

export default class CollectionService {
  /**
   * returns query used to get the latest updated series collections
   * @param limit
   * @param excludeIds
   * @param withPosts
   * @param postLimit
   * @returns
   */
  private static queryGetLastUpdated(withPosts: boolean = true, excludeIds: number[] = [], postLimit: number = 5): ModelQueryBuilderContract<typeof Collection, Collection> {
    return Collection.series()
      .apply(scope => scope.withPostLatestPublished())
      .if(excludeIds.length, query => query.whereNotIn('id', excludeIds))
      .if(withPosts, query => query.preload('postsFlattened', query => query.apply(scope => scope.forCollectionDisplay({ orderBy: 'pivot_root_sort_order', direction: 'desc' })).groupLimit(postLimit)))
      .withCount('postsFlattened', query => query.apply(scope => scope.published()))
      .withAggregate('postsFlattened', query => query.apply(scope => scope.published()).sum('video_seconds').as('videoSecondsSum'))
      .whereHas('postsFlattened', query => query.apply(scope => scope.published()))
      .preload('taxonomies', query => query.groupOrderBy('sort_order', 'asc').groupLimit(3))
      .preload('asset')
      .wherePublic()
      .whereNull('parentId')
      .orderBy('latest_publish_at', 'desc')
      .select(['collections.*'])
  }

  /**
   * gets the latest updated series collections
   * @param limit
   * @param excludeIds
   * @param withPosts
   * @param postLimit
   * @returns
   */
  public static async getLastUpdated(limit: number = 4, withPosts: boolean = true, excludeIds: number[] = [], postLimit: number = 5): Promise<Collection[]> {
    return this.queryGetLastUpdated(withPosts, excludeIds, postLimit).limit(limit)
  }

  /**
   * gets the latest updated series collection
   * @param excludeIds
   * @param withPosts
   * @param postLimit
   * @returns
   */
  public static async getFirstLastUpdated(withPosts: boolean = true, excludeIds: number[] = [], postLimit: number = 5): Promise<Collection> {
    return this.queryGetLastUpdated(withPosts, excludeIds, postLimit).firstOrFail()
  }

  /**
   * returns a list of all root series collections and 3 of their latest published posts
   * @returns
   */
  public static async getList(exclude: number[] | undefined = undefined) {
    return await Collection.series()
        .if(exclude, query => query.whereNotIn('id', <number[]>exclude))
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
  }

  /**
   * returns a root series matching the provided slug
   * @param auth
   * @param slug
   * @returns
   */
  public static async getBySlug(auth: AuthContract, slug: string) {
    return await Collection.series()
      .if(auth.user, query => query.withWatchlist(auth.user!.id))
      .apply(scope => scope.withPublishedPostCount())
      .apply(scope => scope.withPublishedPostDuration())
      .wherePublic()
      .where({ slug })
      .whereNull('parentId')
      .preload('asset')
      .preload('postsFlattened', query => query
        .apply(scope => scope.forCollectionDisplay({ orderBy: 'pivot_root_sort_order' }))
        .if(auth.user, query => query.preload('progressionHistory', query => query.where('userId', auth.user!.id).orderBy('updated_at', 'desc')))
      )
      .preload('children', query => query
        .wherePublic()
        .preload('posts', query => query
          .apply(scope => scope.forCollectionDisplay())
          .if(auth.user, query => query.preload('progressionHistory', query => query.where({ userId: auth.user!.id }).orderBy('updated_at', 'desc')))
        )
      )
      .preload('posts', query => query
        .apply(scope => scope.forCollectionDisplay())
        .if(auth.user, query => query.preload('progressionHistory', query => query.where({ userId: auth.user!.id }).orderBy('updated_at', 'desc')))
      )
      .preload('updatedVersions', query => query
        .wherePublic()
        .whereHas('postsFlattened', query => query.apply(s => s.published()))
      )
      .firstOrFail()
  }

  /**
   * returns a root series matching the provided slug
   * @param auth
   * @param slug
   * @returns
   */
  public static async getByPathSlug(auth: AuthContract, slug: string) {
    return await Collection.paths()
      .if(auth.user, query => query.withWatchlist(auth.user!.id))
      .apply(scope => scope.withPublishedPostCount())
      .apply(scope => scope.withPublishedPostDuration())
      .wherePublic()
      .where({ slug })
      .whereNull('parentId')
      .preload('asset')
      .preload('postsFlattened', query => query
        .apply(scope => scope.forCollectionPathDisplay({ orderBy: 'pivot_root_sort_order' }))
        .if(auth.user, query => query.preload('progressionHistory', query => query.where('userId', auth.user!.id)))
      )
      .preload('children', query => query
        .wherePublic()
        .preload('posts', query => query
          .apply(scope => scope.forCollectionPathDisplay())
          .if(auth.user, query => query.preload('progressionHistory', query => query.where({ userId: auth.user!.id }).orderBy('updated_at', 'desc')))
        )
      )
      .preload('posts', query => query
        .apply(scope => scope.forCollectionPathDisplay())
        .if(auth.user, query => query.preload('progressionHistory', query => query.where({ userId: auth.user!.id }).orderBy('updated_at', 'desc')))
      )
      .preload('updatedVersions', query => query
        .wherePublic()
        .whereHas('postsFlattened', query => query.apply(s => s.published()))
      )
      .firstOrFail()
  }

  /**
   * returns the next lesson for the user based off progression history
   * @param auth
   * @param series
   * @returns
   */
  public static async findNextLesson(auth: AuthContract, series: Collection) {
    let nextLesson = auth.user
      ? series.postsFlattened.find(p => !p.progressionHistory.length || !p.progressionHistory?.at(0)?.isCompleted)
      : null

    if (!nextLesson) nextLesson = series.postsFlattened[0]

    return nextLesson
  }

  /**
   * returns the next lesson after the provided post in the series (if there is one)
   * @param series 
   * @param post 
   * @returns 
   */
  public static findNextSeriesLesson(series: Collection | null, post: Post) {
    if (!series) return
    if (!post?.rootSeries?.length || !series?.postsFlattened?.length) return

    const postRootIndex = post.rootSeries[0].$extras.pivot_root_sort_order
    return series?.postsFlattened.find(p => p.$extras.pivot_root_sort_order === postRootIndex + 1)
  }

  /**
   * returns the next lesson after the provided post in the path (if there is one)
   * @param series 
   * @param post 
   * @returns 
   */
  public static findNextPathLesson(series: Collection | null, post: Post) {
    if (!series) return
    if (!post?.rootPaths?.length || !series?.postsFlattened?.length) return

    const postRootIndex = post.rootPaths[0].$extras.pivot_root_sort_order
    return series?.postsFlattened.find(p => p.$extras.pivot_root_sort_order === postRootIndex + 1)
  }

  /**
   * returns the previous lesson before the provided post in the series (if there is one)
   * @param series 
   * @param post 
   * @returns 
   */
  public static findPrevSeriesLesson(series: Collection | null, post: Post) {
    if (!series) return
    if (!post?.rootSeries?.length || !series?.postsFlattened?.length) return

    const postRootIndex = post.rootSeries[0].$extras.pivot_root_sort_order
    return series?.postsFlattened.find(p => p.$extras.pivot_root_sort_order === postRootIndex - 1)
  }

  /**
   * returns the previous lesson before the provided post in the path (if there is one)
   * @param series 
   * @param post 
   * @returns 
   */
  public static findPrevPathLesson(series: Collection | null, post: Post) {
    if (!series) return
    if (!post?.rootPaths?.length || !series?.postsFlattened?.length) return

    const postRootIndex = post.rootPaths[0].$extras.pivot_root_sort_order
    return series?.postsFlattened.find(p => p.$extras.pivot_root_sort_order === postRootIndex - 1)
  }

  /**
   * seach all root series by term
   * @param term
   * @param limit
   */
  public static async search(term: string, limit: number = 10) {
    if (!term) return
    return Collection.series()
      .apply(scope => scope.withPostLatestPublished())
      .withCount('postsFlattened', query => query.apply(scope => scope.published()))
      .withAggregate('postsFlattened', query => query.apply(scope => scope.published()).sum('video_seconds').as('videoSecondsSum'))
      .preload('taxonomies', query => query.groupOrderBy('sort_order', 'asc').groupLimit(3))
      .preload('asset')
      .wherePublic()
      .whereNull('parentId')
      .where(query => query
        .where('collections.name', 'ILIKE', `%${term}%`)
        .orWhere('collections.description', 'ILIKE', `%${term}%`)
      )
      .orderBy('latest_publish_at', 'desc')
      .select(['collections.*'])
      .limit(limit)
  }
}
