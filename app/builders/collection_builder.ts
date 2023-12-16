import CollectionTypes from "#enums/collection_types";
import States from "#enums/states";
import Collection from "#models/collection";
import Post from "#models/post";
import Taxonomy from "#models/taxonomy";
import User from "#models/user";
import BaseBuilder from "./base_builder.js";

export default class CollectionBuilder extends BaseBuilder<typeof Collection, Collection> {
  constructor(protected user: User | undefined = undefined) {
    super(Collection)
  }

  public static new(user: User | undefined = undefined) {
    return new CollectionBuilder(user)
  }

  public display() {
    this.query.preload('asset')
    this
      .public()
      .watchlist()
      .withTaxonomies()
      .withPostCount()
      .withTotalMinutes()

    return this
  }

  public root() {
    this.query.whereNull('parentId')
    return this
  }

  public series() {
    this.query.where('collectionTypeId', CollectionTypes.SERIES)
    return this
  }

  public path() {
    this.query.where('collectionTypeId', CollectionTypes.PATH)
    return this
  }

  public public() {
    this.whereHasPosts()
    this.query.where({ stateId: States.PUBLIC })
    return this
  }

  public watchlist() {
    if (!this.user) return this
    this.query.withCount('watchlist', query => query.where('userId', this.user!.id))
    return this
  }

  public search(term: string) {
    this.query.where(query => query
      .where('collections.name', 'ILIKE', `%${term}%`)
      .orWhere('collections.description', 'ILIKE', `%${term}%`)
    )
    return this
  }

  public whereWatched() {
    this.query.whereHas('watchlist', query => query.where('userId', this.user!.id))
    return this
  }

  public whereHasPost(post: Post, collectionSlug: string | undefined = undefined) {
    this.query
      .if(collectionSlug, query => query.where('slug', collectionSlug!))
      .whereHas('postsFlattened', query => query.where('posts.id', post.id))
    return this
  }

  public whereHasPosts() {
    this.query.whereHas('postsFlattened', query => query
      .apply(scope => scope.published())
    )
    return this
  }

  public whereHasTaxonomy(taxonomy: Taxonomy) {
    this.query.whereHas('taxonomies', query => query.where('taxonomies.id', taxonomy.id))
    return this
  }

  public whereHasTaxonomies(taxonomies: Taxonomy[] | undefined = undefined) {
    this.query
      .if(taxonomies, 
        query => query.whereHas('taxonomies', query => query.whereIn('taxonomies.id', taxonomies!.map(tax => tax.id))),
        query => query.whereHas('taxonomies', query => query.apply(scope => scope.hasContent()))
      )
    return this
  }

  public withTaxonomies() {
    this.query.preload('taxonomies', query => query
      .groupOrderBy('sort_order', 'asc').groupLimit(3)
    )
    return this
  }

  public withPosts(
    orderBy: 'pivot_sort_order' | 'pivot_root_sort_order' = 'pivot_sort_order',
    direction: 'asc' | 'desc' = 'asc',
    limit: number | undefined = undefined, 
  ) {
    this.query
      .preload('postsFlattened', query => query
        .apply(scope => scope.forDisplay())
        .orderBy(orderBy, direction)
        .if(limit, query => query.groupLimit(limit!))
        .if(this.user, query => query
          .preload('progressionHistory', query => query
            .where({ userId: this.user!.id })
            .orderBy('updated_at', 'desc')
          )
        )
      )
      .preload('posts', query => query
        .apply(scope => scope.forDisplay())
        .orderBy(orderBy, direction)
        .if(this.user, query => query
          .preload('progressionHistory', query => query
            .where({ userId: this.user!.id })
            .orderBy('updated_at', 'desc')
          )
        )
      )
    return this
  }

  public withChildren() {
    this.query
        .preload('children', query => query
        .where('stateId', States.PUBLIC)
        .whereHas('posts', query => query.apply(scope => scope.published()))
        .preload('posts', query => query
          .apply(scope => scope.forCollectionDisplay())
          .if(this.user, query => query
            .preload('progressionHistory', query => query
              .where({ userId: this.user!.id })
              .orderBy('updated_at', 'desc')
            )
          )
        )
      )
    return this
  }

  public withPostCount() {
    this.query.withCount('postsFlattened', query => query
      .apply(scope => scope.published())
    )
    return this
  }

  public withTotalMinutes() {
    this.query.withAggregate('postsFlattened', query => query
      .apply(scope => scope.published())
      .sum('video_seconds')
      .as('videoSecondsSum')
    )
    return this
  }

  public orderLatestUpdated() {
    this.query
      .apply(scope => scope.withPostLatestPublished())
      .orderBy('latest_publish_at', 'desc')
      .select(['collections.*'])

    return this
  }
}