import CollectionTypes from '#enums/collection_types'
import States from '#enums/states'
import Collection from '#models/collection'
import Post from '#models/post'
import Taxonomy from '#models/taxonomy'
import User from '#models/user'
import BaseBuilder from './base_builder.js'

export default class CollectionBuilder extends BaseBuilder<typeof Collection, Collection> {
  constructor(protected user: User | undefined = undefined) {
    super(Collection)
  }

  static new(user: User | undefined = undefined) {
    return new CollectionBuilder(user)
  }

  display() {
    this.query.preload('asset')
    this.public()
      .watchlist()
      .withTaxonomies()
      .withPostCount()
      .withTotalMinutes()
      // .withProgressCount()
      // .query.if(this.user, (truthy) =>
      //   truthy
      //     .withCount('progressionHistory', (query) =>
      //       query.where('userId', this.user!.id).where('isCompleted', true).as('postCompletedCount')
      //     )
      //     .withAggregate('progressionHistory', (query) =>
      //       query.where('userId', this.user!.id).sum('watch_seconds').as('totalWatchSeconds')
      //     )
      // )


    return this
  }

  root() {
    this.query.whereNull('parentId')
    return this
  }

  series() {
    this.query.where('collectionTypeId', CollectionTypes.SERIES)
    return this
  }

  path() {
    this.query.where('collectionTypeId', CollectionTypes.PATH)
    return this
  }

  public() {
    this.whereHasPosts()
    this.query.where({ stateId: States.PUBLIC })
    return this
  }

  watchlist() {
    if (!this.user) return this
    this.query.withCount('watchlist', (query) => query.where('userId', this.user!.id))
    return this
  }

  search(term: string) {
    this.query.where((query) =>
      query
        .where('collections.name', 'ILIKE', `%${term}%`)
        .orWhere('collections.description', 'ILIKE', `%${term}%`)
    )
    return this
  }

  whereInWatchlist() {
    this.query.whereHas('watchlist', (query) => query.where('userId', this.user!.id))
    return this
  }

  whereHasPost(post: Post, collectionSlug: string | undefined = undefined) {
    this.query
      .if(collectionSlug, (query) => query.where('slug', collectionSlug!))
      .whereHas('postsFlattened', (query) => query.where('posts.id', post.id))
    return this
  }

  whereHasPosts() {
    this.query.whereHas('postsFlattened', (query) => query.apply((scope) => scope.published()))
    return this
  }

  whereHasTaxonomy(taxonomy: Taxonomy) {
    this.query.whereHas('taxonomies', (query) => query.where('taxonomies.id', taxonomy.id))
    return this
  }

  whereHasTaxonomies(taxonomies: Taxonomy[] | undefined = undefined) {
    this.query.if(
      taxonomies,
      (query) =>
        query.whereHas('taxonomies', (tax) =>
          tax.whereIn(
            'taxonomies.id',
            taxonomies!.map((item) => item.id)
          )
        ),
      (query) => query.whereHas('taxonomies', (tax) => tax.apply((scope) => scope.hasContent()))
    )
    return this
  }

  withProgressCount() {
    if (!this.user) return this
    this.query.withCount('progressionHistory', (query) => query.where('userId', this.user!.id))
    return this
  }

  withTaxonomies() {
    this.query.preload('taxonomies', (query) =>
      query.groupOrderBy('sort_order', 'asc').groupLimit(3)
    )
    return this
  }

  withPosts(
    orderBy: 'pivot_sort_order' | 'pivot_root_sort_order' = 'pivot_sort_order',
    direction: 'asc' | 'desc' = 'asc',
    limit: number | undefined = undefined
  ) {
    this.query
      .preload('postsFlattened', (query) =>
        query
          .apply((scope) => scope.forDisplay())
          .apply((scope) => scope.published())
          .orderBy(orderBy, direction)
          .if(limit, (truthy) => truthy.groupLimit(limit!))
          .if(this.user, (truthy) =>
            truthy.preload('progressionHistory', (history) =>
              history.where({ userId: this.user!.id }).orderBy('updated_at', 'desc')
            )
          )
      )
      .preload('posts', (query) =>
        query
          .apply((scope) => scope.forDisplay())
          .apply((scope) => scope.published())
          .orderBy(orderBy, direction)
          .if(this.user, (truthy) =>
            truthy.preload('progressionHistory', (history) =>
              history.where({ userId: this.user!.id }).orderBy('updated_at', 'desc')
            )
          )
      )
    return this
  }

  withChildren() {
    this.query.preload('children', (query) =>
      query
        .where('stateId', States.PUBLIC)
        .whereHas('posts', (post) => post.apply((scope) => scope.published()))
        .preload('posts', (post) =>
          post
            .apply((scope) => scope.forCollectionDisplay())
            .apply((scope) => scope.published())
            .if(this.user, (truthy) =>
              truthy.preload('progressionHistory', (history) =>
                history.where({ userId: this.user!.id }).orderBy('updated_at', 'desc')
              )
            )
        )
    )
    return this
  }

  withPostCount() {
    this.query.withCount('postsFlattened', (query) => query.apply((scope) => scope.published()))
    return this
  }

  withTotalMinutes() {
    this.query.withAggregate('postsFlattened', (query) =>
      query
        .apply((scope) => scope.published())
        .sum('video_seconds')
        .as('videoSecondsSum')
    )
    return this
  }

  orderLatestUpdated() {
    this.query
      .apply((scope) => scope.withPostLatestPublished())
      .orderBy('latest_publish_at', 'desc')
      .select(['collections.*'])

    return this
  }
}
