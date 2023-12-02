import PostBuilder from "#builders/post_builder";
import PostTypes from "#enums/post_types";

export default class PostService {
  /**
   * Start a new post builder
   * @returns 
   */
  public builder() {
    return PostBuilder.new()
  }

  /**
   * Return the latest post items for display
   * @param limit 
   * @param excludeIds 
   * @param postTypeIds 
   * @returns 
   */
  public getLatest(limit: number | undefined = undefined, excludeIds: number[] = [], postTypeIds: PostTypes[] | PostTypes | null = null) {
    return this
      .builder()
      .if(excludeIds, builder => builder.exclude(excludeIds))
      .if(postTypeIds, builder => builder.whereType(postTypeIds!))
      .if(limit, query => query.limit(limit!))
      .display()
      .orderPublished()
  }

  /**
   * Returns the latest lessons & livestreams
   * @param limit 
   * @param excludeIds 
   * @returns 
   */
  public getLatestLessons(limit: number | undefined = undefined, excludeIds: number[] = []) {
    return this.getLatest(limit, excludeIds, [PostTypes.LESSON, PostTypes.LIVESTREAM])
  }

  /**
   * Returns the latest blogs and news
   * @param limit 
   * @param excludeIds 
   * @returns 
   */
  public getLatestBlogs(limit: number | undefined = undefined, excludeIds: number[] = []) {
    return this.getLatest(limit, excludeIds, [PostTypes.BLOG, PostTypes.NEWS])
  }

  /**
   * Returns the latest code snippets
   * @param limit 
   * @param excludeIds 
   * @returns 
   */
  public getLatestSnippets(limit: number | undefined = undefined, excludeIds: number[] = []) {
    return this.getLatest(limit, excludeIds, [PostTypes.SNIPPET])
  }

  /**
   * Returns the number of lessons and livestreams published
   * @returns 
   */
  public getLessonCount() {
    return this
      .builder()
      .whereLesson()
      .published()
      .count()
  }
  
  /**
   * Returns the total sum of lessons and livestream video duration
   * @returns 
   */
  public async getLessonDuration() {
    return this
      .builder()
      .whereLesson()
      .published()
      .sum('video_seconds')
  }
}