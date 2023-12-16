import PostBuilder from "#builders/post_builder";
import PostTypes from "#enums/post_types";
import Post from "#models/post";
import { inject } from "@adonisjs/core";
import { HttpContext } from "@adonisjs/core/http";

@inject()
export default class PostService {
  constructor(protected ctx: HttpContext) {}

  public get user() {
    return this.ctx.auth.user
  }

  /**
   * Start a new post builder
   * @returns 
   */
  public builder() {
    return PostBuilder.new(this.user)
  }

  /**
   * Find or fail a post for display by a column value
   * @param column 
   * @param value 
   * @returns 
   */
  public findBy(column: keyof Post, value: any) {
    return this.builder()
      .where(column, value)
      .display({ skipPublishCheck: true })
      .watchlist()
      .withProgression()
      .withComments()
      .firstOrFail()
  }

  /**
   * Returns list of posts for display matching the postTypeIds
   * @param postTypeIds 
   * @returns 
   */
  public getList(postTypeIds: PostTypes[] | PostTypes | null = null) {
    return this
      .builder()
      .if(postTypeIds, builder => builder.whereType(postTypeIds!))
      .display()
  }

  /**
   * Returns lessons and livestreams for display
   * @returns 
   */
  public getLessons() {
    return this.getList([PostTypes.LESSON, PostTypes.LIVESTREAM])
  }

  /**
   * Returns livestreams for display
   * @returns 
   */
  public getStreams() {
    return this.getList([PostTypes.LIVESTREAM])
  }

  /**
   * Returns snippets for display
   * @returns 
   */
  public getSnippets() {
    return this.getList([PostTypes.SNIPPET])
  }

  /**
   * Returns blogs and news for display
   * @returns 
   */
  public getBlogs() {
    return this.getList([PostTypes.BLOG, PostTypes.NEWS])
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
      .getList(postTypeIds)
      .if(excludeIds, builder => builder.exclude(excludeIds))
      .if(limit, query => query.limit(limit!))
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
   * Returns the latest livestreams
   * @param limit 
   * @param excludeIds 
   * @returns 
   */
  public getLatestStreams(limit: number | undefined = undefined, excludeIds: number[] = []) {
    return this.getLatest(limit, excludeIds, [PostTypes.LIVESTREAM])
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

  /**
   * Returns similar posts to the one provided
   * @param post 
   * @param limit 
   * @returns 
   */
  public async getSimilarPosts(post: Post, limit: number = 15) {
    const taxonomyIds = post.taxonomies.map(t => t.id)
    let query = Post.query()
    
    query = query
      .where('postTypeId', post.postTypeId)
      .whereNot('id', post.id)
    
    if (taxonomyIds.length) {
      query = query
        .withAggregate('taxonomies', query => query.whereIn('taxonomies.id', taxonomyIds).count('*').as('taxonomy_matches'))
        .orderBy('taxonomy_matches', 'desc')
    } else {
      query = query.orderBy('publishAt', 'desc')
    }

    return query.apply(scope => scope.forDisplay()).limit(limit)
  }

  public async search(term: string | undefined, limit: number = 15) {
    return this
      .builder()
      .display()
      .if(term, builder => builder.search(term!))
      .orderPublished()
      .limit(limit)
  }
}