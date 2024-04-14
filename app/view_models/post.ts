import Post from "#models/post"
import BaseVM from "./base.js"
import type { ProgressContext } from "#start/context"
import { AssetVM } from "./asset.js"
import { TopicRelationListVM } from "./topic.js"

class PostListSeriesVM {
  declare id: number
  declare slug: string
  declare name: string
  declare lessonIndexDisplay: string
  declare rootSortOrder: number
  declare moduleSortOrder: number

  constructor(post: Post) {
    if (!post.series?.length) return
    
    const series = post.rootSeries.at(0)!
    
    this.id = series.id
    this.slug = series.slug
    this.name = series.name
    this.lessonIndexDisplay = post.lessonIndexDisplay
    this.rootSortOrder = post.$extras.pivot_root_sort_order
    this.moduleSortOrder = post.$extras.pivot_sort_order
  }
}

export class PostListVM extends BaseVM {
  declare id: number
  declare postTypeId: number
  declare paywallTypeId: number
  declare title: string
  declare slug: string
  declare description: string | null
  declare routeUrl: string
  declare publishAtISO: string | null | undefined
  declare publishAtDisplay: string
  declare animatedPreviewUrl: string | undefined
  declare series: PostListSeriesVM | null
  declare topics: TopicRelationListVM[] | null
  declare asset: AssetVM | null

  constructor(post: Post | undefined = undefined) {
    super()

    if (!post) return

    this.id = post.id
    this.postTypeId = post.postTypeId
    this.paywallTypeId = post.paywallTypeId
    this.title = post.title
    this.slug = post.slug
    this.description = post.description
    this.routeUrl = post.routeUrl
    this.publishAtISO = post.publishAt?.toISO()
    this.publishAtDisplay = post.publishAtDisplay
    this.series = this.#getSeries(post)
    this.topics = this.#getTopics(post)
    this.asset = this.#getAsset(post)
    this.animatedPreviewUrl = post.animatedPreviewUrl
  }

  #getSeries(post: Post) {
    if (!post.series?.length) return null
    return new PostListSeriesVM(post)
  }

  #getTopics(post: Post) {
    if (!post.taxonomies?.length) return null
    return post.taxonomies.map(topic => new TopicRelationListVM(topic))
  }

  #getAsset(post: Post) {
    if (!post.thumbnails?.length && !post.assets?.length) return null

    if (post.thumbnails?.length) {
      return new AssetVM(post.thumbnails.at(0)!)
    }
    
    return new AssetVM(post.assets.at(0)!)
  }

  static addToHistory(history: ProgressContext, posts: PostListVM[]) {
    const ids = posts.map(post => post.id)
    history.addPostIds(ids)
  }

  static consume(results: unknown[]) {
    return this.consumable(PostListVM, results)
  }
}
