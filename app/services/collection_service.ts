import CollectionBuilder from "#builders/collection_builder"
import Collection from "#models/collection"
import Post from "#models/post"
import { inject } from "@adonisjs/core"
import { HttpContext } from "@adonisjs/core/http"

@inject()
export default class CollectionService {
  
  constructor(protected ctx: HttpContext) {}

  public get user() {
    return this.ctx.auth.user
  }

  //#region Collection lesson helpers

  /**
   * returns the next lesson after the provided post in the series (if there is one)
   * @param series 
   * @param post 
   * @returns 
   */
  public findNextSeriesLesson(series: Collection | null, post: Post) {
    if (!series) return
    if (!post?.rootSeries?.length || !series?.postsFlattened?.length) return

    const postRootIndex = post.rootSeries[0].$extras.pivot_root_sort_order
    return series?.postsFlattened.find(p => p.$extras.pivot_root_sort_order === postRootIndex + 1)
  }

  /**
   * returns the next lesson after the provided post in the path (if there is one)
   * @param series 
   * @param post 
   * @returns 
   */
  public findNextPathLesson(series: Collection | null, post: Post) {
    if (!series) return
    if (!post?.rootPaths?.length || !series?.postsFlattened?.length) return

    const postRootIndex = post.rootPaths[0].$extras.pivot_root_sort_order
    return series?.postsFlattened.find(p => p.$extras.pivot_root_sort_order === postRootIndex + 1)
  }

  /**
   * returns the previous lesson before the provided post in the series (if there is one)
   * @param series 
   * @param post 
   * @returns 
   */
  public findPrevSeriesLesson(series: Collection | null, post: Post) {
    if (!series) return
    if (!post?.rootSeries?.length || !series?.postsFlattened?.length) return

    const postRootIndex = post.rootSeries[0].$extras.pivot_root_sort_order
    return series?.postsFlattened.find(p => p.$extras.pivot_root_sort_order === postRootIndex - 1)
  }

  /**
   * returns the previous lesson before the provided post in the path (if there is one)
   * @param series 
   * @param post 
   * @returns 
   */
  public findPrevPathLesson(series: Collection | null, post: Post) {
    if (!series) return
    if (!post?.rootPaths?.length || !series?.postsFlattened?.length) return

    const postRootIndex = post.rootPaths[0].$extras.pivot_root_sort_order
    return series?.postsFlattened.find(p => p.$extras.pivot_root_sort_order === postRootIndex - 1)
  }

  //#endregion

  /**
   * Returns a new instance of the collection builder
   * @returns 
   */
  public builder() {
    return new CollectionBuilder(this.user)
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
   * Returns a series by id for display
   * @param id 
   * @returns 
   */
  public find(id: number) {
    return this.findBy('id', id)
  }

  /**
   * Returns a series for display
   * @param column 
   * @param value 
   * @returns 
   */
  public findBy(column: string, value: string | number) {
    return this
      .builder()
      .where(column, value)
      .root()
      .series()
      .public()
      .display()
      .withPosts('pivot_root_sort_order')
      .withChildren()
      .firstOrFail()
  }
  
  /**
   * Returns a post's collection
   * @param post 
   * @param collectionSlug 
   * @returns 
   */
  public findForPost(post: Post, collectionSlug: string | undefined = undefined) {
    return this
      .builder()
      .whereHasPost(post, collectionSlug)
      .root()
      .series()
      .public()
      .display()
      .withPosts('pivot_root_sort_order')
      .withChildren()
      .first()
  }

  public findNextLesson(collection: Collection) {
    let next = this.user
      ? collection.postsFlattened.find(post => !post.progressionHistory?.length || !post.progressionHistory?.at(0)?.isCompleted)
      : null

    if (!next) next = collection.postsFlattened.at(0)

    return next
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
      .if(withPosts, (builder) => builder.withPosts('pivot_root_sort_order', 'desc', postLimit))
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
  public getLastUpdated(limit: number | undefined = undefined, withPosts: boolean = true, excludeIds: number[] = [], postLimit: number = 4) {
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

  public async search(term: string | undefined, limit: number = 8) {
    return this
      .builder()
      .display()
      .root()
      .if(term, builder => builder.search(term!))
      .orderLatestUpdated()
      .limit(limit)
  }
}