import TaxonomyBuilder from "#builders/taxonomy_builder";

export default class TaxonomyService {
  public getList(postLimit: number = 0) {
    return TaxonomyBuilder.new()
      .if(postLimit, builder => builder.withPosts(postLimit))
      .display()
      .withCollectionCount()
      .withPostCount()
      .order()
  }
}