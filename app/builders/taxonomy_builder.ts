import AssetTypes from '#enums/asset_types'
import Post from '#models/post'
import Taxonomy from '#models/taxonomy'
import BaseBuilder from './base_builder.js'

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
      .withCollectionCount()
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

  withCollectionCount() {
    this.query.withCount('collections')
    return this
  }

  withPosts(
    limit: number | undefined,
    orderBy: keyof Post | 'publish_at' = 'publish_at',
    direction: 'asc' | 'desc' = 'desc'
  ) {
    this.query.preload('posts', (query) =>
      query
        .apply((scope) => scope.forDisplay())
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
        .as('videoSecondsSum')
    )
    return this
  }

  order(column: keyof Taxonomy = 'name', dir: 'asc' | 'desc' = 'asc') {
    this.query.orderBy(column, dir)
    return this
  }
}
