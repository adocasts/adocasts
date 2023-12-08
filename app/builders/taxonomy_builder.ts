import CollectionTypes from "#enums/collection_types";
import States from "#enums/states";
import Post from "#models/post";
import Taxonomy from "#models/taxonomy";
import BaseBuilder from "./base_builder.js";

export default class TaxonomyBuilder extends BaseBuilder<typeof Taxonomy, Taxonomy> {
  constructor() {
    super(Taxonomy)
  }

  public static new() {
    return new TaxonomyBuilder()
  }

  public display() {
    this
      .public()
      .withPostCount()
      .withCollectionCount()
      .query
      .preload('asset')
      .preload('parent', query => query.preload('asset'))

    return this
  }

  public public() {
    this.query.apply(scope => scope.hasContent())
    return this
  }

  public search(term: string) {
    this.query.where(query => query
      .where('taxonomies.name', 'ILIKE', `%${term}%`)
      .orWhere('taxonomies.description', 'ILIKE', `%${term}%`)
    )
    return this
  }

  public withPostCount() {
    this.query.withCount('posts')
    return this
  }

  public withCollectionCount() {
    this.query.withCount('collections')
    return this
  }

  public withPosts(
    limit: number | undefined, 
    orderBy: keyof Post | 'publish_at' = 'publish_at',
    direction: 'asc' | 'desc' = 'desc'
  ) {
    this.query.preload('posts', query => query
      .apply(scope => scope.forDisplay())
      .orderBy(orderBy, direction)
      .if(limit, query => query.groupLimit(limit!))
      .if(orderBy, query => query.groupOrderBy(orderBy, direction))
    )
    return this
  }

  public withTotalMinutes() {
    this.query.withAggregate('posts', query => query
      .apply(scope => scope.published())
      .sum('video_seconds')
      .as('videoSecondsSum')
    )
    return this
  }

  public order(column: keyof Taxonomy = 'name', dir: 'asc' | 'desc' = 'asc') {
    this.query.orderBy(column, dir)
    return this
  }
}