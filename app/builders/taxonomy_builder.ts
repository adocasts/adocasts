import BaseBuilder from '#builders/base_builder'
import AssetTypes from '#enums/asset_types'
import PostTypes from '#enums/post_types'
import Post from '#models/post'
import Taxonomy from '#models/taxonomy'

export default class TaxonomyBuilder extends BaseBuilder<typeof Taxonomy, Taxonomy> {
  constructor() {
    super(Taxonomy)
  }

  static new() {
    return new TaxonomyBuilder()
  }

  display() {
    this.public()
      .withPostCount()
      .withLessonCount()
      .withStreamCount()
      .withBlogCount()
      .withSnippetCount()
      .withCollectionCount()
      .withTotalMinutes()
      .query.preload('asset')
      .preload('parent', (query) => query.preload('asset'))

    return this
  }

  public() {
    this.query.apply((scope) => scope.hasContent())
    return this
  }

  search(term: string) {
    this.query.where((query) =>
      query
        .where('taxonomies.name', 'ILIKE', `%${term}%`)
        .orWhere('taxonomies.description', 'ILIKE', `%${term}%`)
    )
    return this
  }

  withPostCount() {
    this.query.withCount('posts')
    return this
  }

  withLessonCount() {
    this.query.withCount('posts', (q) =>
      q.whereIn('postTypeId', [PostTypes.LESSON, PostTypes.LIVESTREAM]).as('lessons_count')
    )
    return this
  }

  withStreamCount() {
    this.query.withCount('posts', (q) =>
      q.where('postTypeId', PostTypes.LIVESTREAM).as('streams_count')
    )
    return this
  }

  withBlogCount() {
    this.query.withCount('posts', (q) =>
      q.whereIn('postTypeId', [PostTypes.BLOG, PostTypes.NEWS]).as('blogs_count')
    )
    return this
  }

  withSnippetCount() {
    this.query.withCount('posts', (q) =>
      q.where('postTypeId', PostTypes.SNIPPET).as('snippets_count')
    )
    return this
  }

  withCollectionCount() {
    this.query.withCount('collections')
    return this
  }

  withDiscussionCount() {
    this.query.withCount('discussions')
    return this
  }

  withPosts(
    limit: number | undefined,
    orderBy: keyof Post | 'publish_at' = 'publish_at',
    direction: 'asc' | 'desc' = 'desc'
  ) {
    this.query.preload('posts', (query) =>
      query
        .apply((scope) => scope.forLessonDisplay())
        .apply((scope) => scope.published())
        .whereHas('assets', (assets) => assets.where('assetTypeId', AssetTypes.THUMBNAIL))
        .orderBy(orderBy, direction)
        .if(limit, (truthy) => truthy.groupLimit(limit!))
        .if(orderBy, (truthy) => truthy.groupOrderBy(orderBy, direction))
    )
    return this
  }

  withTotalMinutes() {
    this.query.withAggregate('posts', (query) =>
      query
        .apply((scope) => scope.published())
        .sum('video_seconds')
        .as('video_seconds_sum')
    )
    return this
  }

  whereHasDiscussion() {
    this.query.whereHas('discussions', (query) => query)
    return this
  }

  order(column: keyof Taxonomy = 'name', dir: 'asc' | 'desc' = 'asc') {
    this.query.orderBy(column, dir)
    return this
  }
}
