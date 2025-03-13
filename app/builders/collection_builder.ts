import CollectionTypes from '#enums/collection_types'
import States from '#enums/states'
import Status from '#enums/status'
import Collection from '#models/collection'
import Post from '#models/post'
import Taxonomy from '#models/taxonomy'
import { ManyToManyQueryBuilderContract } from '@adonisjs/lucid/types/relations'
import BaseTopicDto from '../dtos/topics/base_topic.js'
import BaseBuilder from './base_builder.js'

export default class CollectionBuilder extends BaseBuilder<typeof Collection, Collection> {
  constructor() {
    super(Collection)
    this.beforeQuery(() => this.public(), 'public')
  }

  static new() {
    return new CollectionBuilder()
  }

  display() {
    this.query.preload('asset')
    this.public().withTaxonomies().withPostCount().withTotalMinutes()

    return this
  }

  root() {
    this.query.whereNull('parentId')
    return this
  }

  series() {
    this.root()
    this.query.where('collectionTypeId', CollectionTypes.SERIES)
    return this
  }

  path() {
    this.root()
    this.query.where('collectionTypeId', CollectionTypes.PATH)
    return this
  }

  public() {
    this.whereHasPosts()
    this.query.where({ stateId: States.PUBLIC })
    return this
  }

  publicOrPreview() {
    this.withNonPublic()
    this.query.where({ stateId: States.PUBLIC }).where((query) => {
      query
        // where has posts
        .whereHas('postsFlattened', (posts) => posts.apply((scope) => scope.published()))
        // or where status is coming soon
        .orWhere('statusId', Status.COMING_SOON)
    })
    return this
  }

  withNonPublic() {
    this.removeBeforeQuery('public')
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

  whereHasTaxonomy(taxonomy: Taxonomy | BaseTopicDto) {
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

  withAsset() {
    this.query.preload('asset')
    return this
  }

  withTaxonomies() {
    this.query.preload('taxonomies', (query) =>
      query.groupOrderBy('sort_order', 'asc').groupLimit(3)
    )
    return this
  }

  withPosts(
    postQuery: (
      query: ManyToManyQueryBuilderContract<typeof Post, any>
    ) => ManyToManyQueryBuilderContract<typeof Post, any>,
    {
      orderBy = 'pivot_root_sort_order',
      direction = 'desc',
    }: {
      orderBy?: 'pivot_sort_order' | 'pivot_root_sort_order'
      direction?: 'asc' | 'desc'
    } = {}
  ) {
    this.query.preload('posts', (query) =>
      query
        .apply((scope) => scope.forDisplay())
        .apply((scope) => scope.published())
        .orderBy(orderBy, direction)
        .if(postQuery, (q) => postQuery(q))
    )
    return this
  }

  withPostsFlat(
    postQuery?: (
      query: ManyToManyQueryBuilderContract<typeof Post, any>
    ) => ManyToManyQueryBuilderContract<typeof Post, any>,
    {
      orderBy = 'pivot_root_sort_order',
      direction = 'desc',
      limit,
    }: {
      orderBy?: 'pivot_sort_order' | 'pivot_root_sort_order'
      direction?: 'asc' | 'desc'
      limit?: number
    } = {}
  ) {
    this.query.preload('postsFlattened', (query) =>
      query
        .apply((scope) => scope.forDisplay())
        .apply((scope) => scope.published())
        .orderBy(orderBy, direction)
        .if(limit, (truthy) => truthy.groupLimit(limit!))
        .if(typeof postQuery === 'function', (q) => postQuery(q))
    )
    return this
  }

  withChildren() {
    this.query.preload('children', (query) =>
      query
        .where('stateId', States.PUBLIC)
        .whereHas('posts', (post) => post.apply((scope) => scope.published()))
        .preload('posts', (post) =>
          post.apply((scope) => scope.forCollectionDisplay()).apply((scope) => scope.published())
        )
    )
    return this
  }

  withPostCount() {
    this.query.withCount('postsFlattened', (query) =>
      query.apply((scope) => scope.published()).as('posts_count')
    )
    return this
  }

  withTotalMinutes() {
    this.query.withAggregate('postsFlattened', (query) =>
      query
        .apply((scope) => scope.published())
        .sum('video_seconds')
        .as('video_seconds_sum')
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
