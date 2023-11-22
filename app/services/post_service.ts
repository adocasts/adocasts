import PostBuilder from "#builders/post_builder";
import PostTypes from "#enums/post_types";

export default class PostService {
  /**
   * Return the latest post items for display
   * @param limit 
   * @param excludeIds 
   * @param postTypeIds 
   * @returns 
   */
  public async getLatest(limit: number = 10, excludeIds: number[] = [], postTypeIds: PostTypes[] | PostTypes | null = null) {
    return PostBuilder.new()
      .if(excludeIds, builder => builder.exclude(excludeIds))
      .if(postTypeIds, builder => builder.whereType(postTypeIds!))
      .display()
      .orderPublished()
      .limit(limit)
  }

  /**
   * Returns the latest lessons & livestreams
   * @param limit 
   * @param excludeIds 
   * @returns 
   */
  public async getLatestLessons(limit: number = 10, excludeIds: number[] = []) {
    return this.getLatest(limit, excludeIds, [PostTypes.LESSON, PostTypes.LIVESTREAM])
  }

  /**
   * Returns the latest blogs and news
   * @param limit 
   * @param excludeIds 
   * @returns 
   */
  public async getLatestBlogs(limit: number = 10, excludeIds: number[] = []) {
    return this.getLatest(limit, excludeIds, [PostTypes.BLOG, PostTypes.NEWS])
  }

  /**
   * Returns the latest code snippets
   * @param limit 
   * @param excludeIds 
   * @returns 
   */
  public async getLatestSnippets(limit: number = 10, excludeIds: number[] = []) {
    return this.getLatest(limit, excludeIds, [PostTypes.SNIPPET])
  }
}