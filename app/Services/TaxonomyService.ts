import { ModelQueryBuilderContract } from "@ioc:Adonis/Lucid/Orm";
import CollectionTypes from "App/Enums/CollectionTypes";
import Taxonomy from "App/Models/Taxonomy";
import States from "App/Enums/States";
import PostTypes from "App/Enums/PostTypes";

export default class TaxonomyService {
  private static queryGetList(): ModelQueryBuilderContract<typeof Taxonomy, Taxonomy> {
    return Taxonomy.query()
      .apply(scope => scope.hasContent())
      .preload('parent', query => query.preload('asset'))
      .preload('asset')
      .withCount('posts')
      .withCount('collections')
      .where(query => query
        .whereHas('posts', query => query.apply(scope => scope.published()))
        .orWhereHas('collections', query => query.whereHas('postsFlattened', query => query.apply(scope => scope.published())))
      )
      .orderBy('name')
  }

  /**
   * returns list of taxonomies and their children
   * @returns
   */
  public static async getList(postLimit: number = 0) {
    if (!postLimit) {
      return this.queryGetList()
    }

    return this.queryGetList()
      .preload('posts', query => query
        .apply(scope => scope.forDisplay())
        .groupLimit(3)
      )
      .orderBy([
        { column: 'isFeatured', order: 'desc' },
        { column: 'name', order: 'asc' }
      ])
  }

  /**
   * returns taxonomy matching slug
   * @param slug
   * @returns
   */
  public static async getBySlug(slug: string) {
    return Taxonomy.query()
      .preload('asset')
      .preload('parent')
      .where({ slug })
      .firstOrFail()
  }

  /**
   * returns child taxonomies for provided taxonomy
   * @param taxonomy
   * @returns
   */
  public static async getChildren(taxonomy: Taxonomy) {
    return taxonomy.related('children').query()
      .apply(scope => scope.hasContent())
      .preload('parent', query => query.preload('asset'))
      .preload('asset')
      .withCount('posts')
      .withCount('collections', query => query.where('collectionTypeId', CollectionTypes.SERIES).wherePublic())
      .where(query => query
        .whereHas('posts', query => query.apply(scope => scope.published()))
        .orWhereHas('collections', query => query.whereHas('postsFlattened', query => query.apply(scope => scope.published())))
      )
      .orderBy('name')
  }

  /**
   * returns posts tied to provided taxonomy
   * @param taxonomy
   * @param limit
   * @returns
   */
  public static async getPosts(taxonomy: Taxonomy, limit?: number) {
    return taxonomy.related('posts').query()
        .whereIn('postTypeId', [PostTypes.LESSON, PostTypes.LIVESTREAM, PostTypes.NEWS, PostTypes.BLOG])
        .orderBy('publishAt', 'desc')
        .apply(scope => scope.forDisplay())
        .if(limit, query => query.limit(limit!))
  }

  /**
   * returns collections tied to provided taxonomy
   * @param taxonomy
   * @param collectionTypes
   * @param limit
   * @returns
   */
  public static async getCollections(taxonomy: Taxonomy, collectionTypes: CollectionTypes[] = [CollectionTypes.SERIES], limit?: number) {
    return taxonomy.related('collections').query()
        .wherePublic()
        .whereIn('collectionTypeId', collectionTypes)
        .withCount('postsFlattened', query => query.apply(scope => scope.published()))
        .withAggregate('postsFlattened', query => query.apply(scope => scope.published()).sum('video_seconds').as('videoSecondsSum'))
        .whereHas('postsFlattened', query => query.apply(scope => scope.published()))
        .preload('taxonomies', query => query.groupOrderBy('sort_order', 'asc').groupLimit(3))
        .preload('asset')
        .orderBy('name')
        .if(limit, query => query.limit(limit!))
  }

  /**
   * search all taxonomies by pattern
   * @param term
   * @param limit
   */
  public static async search(term: string, limit: number = 10) {
    if (!term) return
    return Taxonomy.query()
      .apply(scope => scope.withPostLatestPublished())
      .preload('parent', query => query.preload('asset'))
      .preload('asset')
      .withCount('posts', query => query.apply(scope => scope.published()))
      .withCount('collections', query => query.where('collectionTypeId', CollectionTypes.SERIES).where('stateId', States.PUBLIC))
      .where(query => query
        .where('taxonomies.name', 'ILIKE', `%${term}%`)
        .orWhere('taxonomies.description', 'ILIKE', `%${term}%`)
      )
      .orderBy('latest_publish_at', 'desc')
      .select('taxonomies.*')
      .limit(limit)
  }
}
