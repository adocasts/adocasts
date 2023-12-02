import TaxonomyBuilder from "#builders/taxonomy_builder";
import Taxonomy from "#models/taxonomy";

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
      .order()
  }

  /**
   * Returns a taxonomy for display by slug
   * @param slug 
   * @returns 
   */
  public getBySlug(slug: string) {
    return this
      .builder()
      .display()
      .withTotalMinutes()
      .where('slug', slug)
      .firstOrFail()
  }

  /**
   * Returns a taxonomies children for display
   * @param taxonomy 
   * @returns 
   */
  public getChildren(taxonomy: Taxonomy) {
    return this
      .builder()
      .where('parent_id', taxonomy.id)
      .display()
      .order()
  }
}