import TaxonomyBuilder from "#builders/taxonomy_builder";

export default class TaxonomyService {
  /**
   * Returns a new instance of the taxonomy builder
   * @returns 
   */
  public builder() {
    return TaxonomyBuilder.new()
  }

  /**
   * Returns the total number of topics
   * @returns 
   */
  public getCount() {
    return this
      .builder()
      .public()
      .count()
  }

  /**
   * Returns displayable list of topics
   * @param postLimit 
   * @returns 
   */
  public getList(postLimit: number = 0) {
    return this
      .builder()
      .if(postLimit, builder => builder.withPosts(postLimit))
      .display()
      .withCollectionCount()
      .withPostCount()
      .order()
  }
}