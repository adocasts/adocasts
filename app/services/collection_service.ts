import CollectionBuilder from "#builders/collection_builder"

export default class CollectionService {
  /**
   * Returns a new instance of the collection builder
   * @returns 
   */
  public builder() {
    return new CollectionBuilder()
  }

  /**
   * Returns the number of public root series
   * @returns 
   */
  public async getSeriesCount() {
    return this
      .builder()
      .series()
      .public()
      .root()
      .count()
  }

  /**
   * Returns the most recently updated series
   * @returns 
   */
  public async getFeatured() {
    const latest = await this.getLastUpdated(1, true, undefined, 4)
    return latest.at(0)
  }

  /**
   * returns a collection query builder to retrieve a list of series
   * @param withPosts 
   * @param excludeIds 
   * @param postLimit 
   * @returns 
   */
  public getList(withPosts: boolean = true, excludeIds: number[] = [], postLimit: number = 3) {
    return this
      .builder()
      .series()
      .if(withPosts, (builder) => builder.withPosts(postLimit, 'pivot_root_sort_order', 'desc'))
      .if(excludeIds, (builder) => builder.exclude(excludeIds))
      .root()
      .display()
  }

  /**
   * gets the latest updated series collections
   * @param limit
   * @param excludeIds
   * @param withPosts
   * @param postLimit
   * @returns
   */
  public async getLastUpdated(limit: number | undefined = undefined, withPosts: boolean = true, excludeIds: number[] = [], postLimit: number = 5) {
    return this
      .queryGetLastUpdated(withPosts, excludeIds, postLimit)
      .if(limit, builder => builder.limit(limit!))
  }

  /**
   * returns query used to get the latest updated series collections
   * @param limit
   * @param excludeIds
   * @param withPosts
   * @param postLimit
   * @returns
   */
  private queryGetLastUpdated(withPosts: boolean = true, excludeIds: number[] = [], postLimit: number = 3) {
    return this.getList(withPosts, excludeIds, postLimit).orderLatestUpdated()
  }
}