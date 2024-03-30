import Collection from "#models/collection";
import type { HistoryContext } from "#start/context";
import AssetVM from "./asset.js";
import BaseVM from "./base.js";
import PostListVM from "./post.js";

export default class SeriesListVM extends BaseVM {
  declare id: number
  declare difficultyId: number | null
  declare name: string
  declare slug: string
  declare description: string
  declare asset: AssetVM | null
  declare posts: PostListVM[] | null

  get postIds() {
    if (!this.posts) return []
    return this.posts.map(post => post.id)
  }

  constructor(series: Collection) {
    super()

    this.id = series.id
    this.difficultyId = series.difficultyId
    this.name = series.name
    this.slug = series.slug
    this.description = series.description
    this.asset = this.#getAsset(series)
    this.posts = series.postsFlattened.map((post) => new PostListVM(post))
    this.meta = {
      postsCount: series.$extras.postsFlattened_count || 0,
      videoSecondsSum: series.$extras.videoSecondsSum || 0,
    }
  }

  #getAsset(collection: Collection) {
    if (!collection.asset) return null
    return new AssetVM(collection.asset)
  }

  static addToHistory(history: HistoryContext, results: SeriesListVM[]) {
    const ids = results.map(record => record.id)
    const postIds = this.getPostIds(results)

    history.addCollectionIds(ids)
    history.addPostIds(postIds)
  }

  static getPostIds(results: SeriesListVM[]) {
    return results.reduce<number[]>((ids, series) => [
      ...ids,
      ...(series?.postIds || []),
    ], [])
  }
}
