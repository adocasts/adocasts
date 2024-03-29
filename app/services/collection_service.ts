import CollectionBuilder from '#builders/collection_builder'
import Collection from '#models/collection'
import Post from '#models/post'
import { inject } from '@adonisjs/core'
import { HttpContext } from '@adonisjs/core/http'
import User from '#models/user'

@inject()
export default class CollectionService {
  constructor(protected ctx: HttpContext) {}

  get user() {
    return this.ctx.auth.user
  }

  /**
   * Returns a new instance of the collection builder
   * @returns
   */
  builder() {
    return new CollectionBuilder(this.user)
  }

  /**
   * Search for collections by a term
   * @param term
   * @param limit
   * @returns
   */
  async search(term: string | undefined, limit: number = 8) {
    return this.builder()
      .display()
      .root()
      .if(term, (builder) => builder.search(term!))
      .orderLatestUpdated()
      .limit(limit)
  }

  //#region Collection lesson helpers

  /**
   * returns the next lesson after the provided post in the series (if there is one)
   * @param series
   * @param post
   * @returns
   */
  findNextSeriesLesson(series: Collection | null, post: Post) {
    if (!series) return
    if (!post?.rootSeries?.length || !series?.postsFlattened?.length) return

    const postRootIndex = post.rootSeries[0].$extras.pivot_root_sort_order
    return series?.postsFlattened.find((p) => p.$extras.pivot_root_sort_order === postRootIndex + 1)
  }

  /**
   * returns the next lesson after the provided post in the path (if there is one)
   * @param series
   * @param post
   * @returns
   */
  findNextPathLesson(series: Collection | null, post: Post) {
    if (!series) return
    if (!post?.rootPaths?.length || !series?.postsFlattened?.length) return

    const postRootIndex = post.rootPaths[0].$extras.pivot_root_sort_order
    return series?.postsFlattened.find((p) => p.$extras.pivot_root_sort_order === postRootIndex + 1)
  }

  /**
   * returns the previous lesson before the provided post in the series (if there is one)
   * @param series
   * @param post
   * @returns
   */
  findPrevSeriesLesson(series: Collection | null, post: Post) {
    if (!series) return
    if (!post?.rootSeries?.length || !series?.postsFlattened?.length) return

    const postRootIndex = post.rootSeries[0].$extras.pivot_root_sort_order
    return series?.postsFlattened.find((p) => p.$extras.pivot_root_sort_order === postRootIndex - 1)
  }

  /**
   * returns the previous lesson before the provided post in the path (if there is one)
   * @param series
   * @param post
   * @returns
   */
  findPrevPathLesson(series: Collection | null, post: Post) {
    if (!series) return
    if (!post?.rootPaths?.length || !series?.postsFlattened?.length) return

    const postRootIndex = post.rootPaths[0].$extras.pivot_root_sort_order
    return series?.postsFlattened.find((p) => p.$extras.pivot_root_sort_order === postRootIndex - 1)
  }

  //#endregion

  //#region Find

  /**
   * Returns a series by id for display
   * @param id
   * @returns
   */
  find(id: number) {
    return this.findBy('id', id)
  }

  /**
   * Returns a series for display
   * @param column
   * @param value
   * @returns
   */
  findBy(column: string, value: string | number) {
    return this.builder()
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
  findForPost(post: Post, collectionSlug: string | undefined = undefined) {
    return this.builder()
      .whereHasPost(post, collectionSlug)
      .root()
      .series()
      .public()
      .display()
      .withPosts('pivot_root_sort_order')
      .withChildren()
      .first()
  }

  findNextLesson(collection: Collection) {
    return CollectionService.findNextLesson(this.user, collection)
  }

  static findNextLesson(user: User | undefined, collection: Collection) {
    let next = user
      ? collection.postsFlattened.find(
          (post) => !post.progressionHistory?.length || !post.progressionHistory?.at(0)?.isCompleted
        )
      : null

    if (!next) next = collection.postsFlattened.at(0)

    return next
  }

  //#endregion

  //#region Get

  /**
   * Returns the number of public root series
   * @returns
   */
  async getSeriesCount() {
    return this.builder().series().public().root().count()
  }

  /**
   * Returns the most recently updated series
   * @returns
   */
  async getFeatured() {
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
  getList(withPosts: boolean = true, excludeIds: number[] = [], postLimit: number = 3) {
    return this.builder()
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
  getLastUpdated(
    limit: number | undefined = undefined,
    withPosts: boolean = true,
    excludeIds: number[] = [],
    postLimit: number = 4
  ) {
    return this.queryGetLastUpdated(withPosts, excludeIds, postLimit).if(limit, (builder) =>
      builder.limit(limit!)
    )
  }

  /**
   * returns query used to get the latest updated series collections
   * @param limit
   * @param excludeIds
   * @param withPosts
   * @param postLimit
   * @returns
   */
  private queryGetLastUpdated(
    withPosts: boolean = true,
    excludeIds: number[] = [],
    postLimit: number = 3
  ) {
    return this.getList(withPosts, excludeIds, postLimit).orderLatestUpdated()
  }

  //#endregion
}
