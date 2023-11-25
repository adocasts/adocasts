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
    orderBy: keyof Post = 'publishAt',
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

  public order(column: keyof Taxonomy = 'name', dir: 'asc' | 'desc' = 'asc') {
    this.query.orderBy(column, dir)
    return this
  }
}