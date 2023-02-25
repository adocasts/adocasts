import { AuthContract } from "@ioc:Adonis/Addons/Auth";
import { ModelQueryBuilderContract } from "@ioc:Adonis/Lucid/Orm";
import Collection from "App/Models/Collection";

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
      .if(withPosts, query => query.preload('postsFlattened', query => query.apply(scope => scope.forCollectionDisplay()).groupLimit(postLimit)))
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
  public static async getList() {
    return await Collection.series()
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
        .if(auth.user, query => query.preload('progressionHistory', query => query.where('userId', auth.user!.id)))
      )
      .preload('children', query => query
        .wherePublic()
        .preload('posts', query => query
          .apply(scope => scope.forCollectionDisplay())
          .if(auth.user, query => query.preload('progressionHistory', query => query.where({ userId: auth.user!.id }).orderBy('updated_at', 'desc')))
        )
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
      ? series.postsFlattened.find(p => !p.progressionHistory.length || p.progressionHistory.some(h => !h.isCompleted))
      : null

    if (!nextLesson) nextLesson = series.postsFlattened[0]

    return nextLesson
  }
}