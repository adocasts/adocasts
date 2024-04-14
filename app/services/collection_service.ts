import CollectionBuilder from '#builders/collection_builder'
import Collection from '#models/collection'
import Post from '#models/post'
import { inject } from '@adonisjs/core'
import { HttpContext } from '@adonisjs/core/http'
import User from '#models/user'
import { SeriesListVM, SeriesShowVM } from '../view_models/series.js'
import bento from './bento_service.js'
import { ProgressContext } from '#start/context'
import Watchlist from '#models/watchlist'
import Taxonomy from '#models/taxonomy'
import { TopicListVM } from '../view_models/topic.js'

@inject()
export default class CollectionService {
  constructor(protected ctx: HttpContext) {}

  get user() {
    return this.ctx.auth.user
  }

  get cache() {
    return bento.namespace('COLLECTIONS')
  }

  /**
   * Returns collections for the recently updated series sections
   * @returns { latest: SeriesListVM, recent: SeriesListVM[] }
   */
  async getRecentlyUpdated() {
    const { latest, recent } = await this.cache.getOrSet('GET_RECENTLY_UPDATED', async () => {
      const latest = await this.queryGetLastUpdated(true, [], 4).toListVM()
      const recent = await this.queryGetLastUpdated(true, [], 0).limit(6).toListVM()
      return { 
        latest: latest.at(0), 
        recent: recent
      }  
    })

    if (latest) {
      SeriesListVM.addToHistory(this.ctx.history, [latest])
    }
    
    SeriesListVM.addToHistory(this.ctx.history, recent)

    return { latest, recent }
  }

  async getAll() {
    const results = await this.cache.getOrSet('GET_ALL', async () => {
      const series = await this.getList(true).orderBy('name')
      return series.map(series => new SeriesListVM(series))
    })

    SeriesListVM.addToHistory(this.ctx.history, results)

    return results
  }

  async getBySlug(slug: string) {
    const result = await this.cache.getOrSet(`GET_BY_SLUG_${slug}`, async () => {
      const series = await this.findBy('slug', slug)
      return new SeriesShowVM(series)
    })
    
    SeriesShowVM.addToHistory(this.ctx.history, result)

    return SeriesShowVM.consume(result)
  }

  async getCachedForTaxonomy(taxonomy: Taxonomy | TopicListVM) {
    const results = await this.cache.getOrSet(`GET_FOR_TAXONOMY_${taxonomy.id}`, async () => {
      return this.getLastUpdated(undefined, false).whereHasTaxonomy(taxonomy).toListVM()
    })

    SeriesListVM.addToHistory(this.ctx.history, results)

    return results
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

  findNextProgressLesson(series: SeriesShowVM, progress: ProgressContext) {
    if (!series?.postIds) return

    for (const id of series.postIds) {
      const history = progress.post(id)
      
      // if post is completed, skip
      if (history?.isCompleted) continue

      // find post within series
      let post = series.posts?.find((post) => post.id === id)

      // if post is found, return it
      if (post) return post

      // find post within modules
      for (const module of series.modules) {
        post = module.posts?.find((post) => post.id === id)
        if (post) return post
      }
    }

    return series.posts?.at(0) ?? series.modules?.at(0)?.posts?.at(0)
  }

  async getIsInWatchlist(user: User | undefined, series: SeriesShowVM) {
    if (!user) return false
    const results = await Watchlist.query().where('collectionId', series.id).where('userId', user.id).select('id').first()
    return !!results
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
