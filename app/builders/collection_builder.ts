import States from "#enums/states";
import Collection from "#models/collection";

export default class CollectionBuilder {
  protected query = Collection.query()

  constructor() {}

  public static new() {
    return new CollectionBuilder()
  }

  public if(condition: any, cb: (self: this) => this) {
    if (condition) {
      return cb(this)
    }
    return this
  }

  public display() {
    this
      .whereHasPosts()
      .withTaxonomies()
      .withPostCount()
      .withTotalMinutes()
      .query
      .preload('asset')
      .where({ stateId: States.PUBLIC })

    return this
  }

  public root() {
    this.query.whereNull('parentId')
    return this
  }

  public limit(limit: number) {
    this.query.limit(limit)
    return this
  }

  public exclude(values: any[], column: string = 'id') {
    this.query.whereNotIn(column, values)
    return this
  }

  public whereHasPosts() {
    this.query.whereHas('postsFlattened', query => query
      .apply(scope => scope.published())
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
    limit: number | undefined, 
    orderBy: 'pivot_sort_order' | 'pivot_root_sort_order' = 'pivot_sort_order',
    direction: 'asc' | 'desc' = 'asc'
  ) {
    this.query.preload('postsFlattened', query => query
      .apply(scope => scope.forDisplay())
      .orderBy(orderBy, direction)
      .if(limit, query => query.groupLimit(limit!))
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

  public then(
    onfulfilled?: ((value: Collection[]) => Collection[] | PromiseLike<Collection[]>) | null | undefined,
    onrejected?: ((reason: any) => PromiseLike<never>) | null | undefined
  ) {
    return this.query.then(onfulfilled, onrejected)
  }
}