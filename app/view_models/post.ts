import Post from "#models/post"
import BaseVM from "./base.js"
import type { ProgressContext } from "#start/context"
import { AssetVM } from "./asset.js"
import { TopicRelationListVM } from "./topic.js"
import { UserVM } from "./user.js"
import VideoTypes from "#enums/video_types"

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
    this.rootSortOrder = post.$extras.pivot_root_sort_order || series.$extras.pivot_root_sort_order
    this.moduleSortOrder = post.$extras.pivot_sort_order || series.$extras.pivot_sort_order
  }
}

class PostBaseVM extends BaseVM {
  declare id: number
  declare postTypeId: number
  declare paywallTypeId: number
  declare title: string
  declare slug: string
  declare description: string | null
  declare routeUrl: string
  declare publishAtISO: string | null | undefined
  declare publishAtDisplay: string
  declare watchMinutes: string | number
  declare series: PostListSeriesVM | null
  declare topics: TopicRelationListVM[] | null
  declare asset: AssetVM | null
  declare meta: Record<string, any>

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
    this.watchMinutes = post.watchMinutes
    this.series = this.#getSeries(post)
    this.topics = this.#getTopics(post)
    this.asset = this.#getAsset(post)
    this.meta = {}
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
}

export class PostListVM extends PostBaseVM {
  declare animatedPreviewUrl: string | undefined

  constructor(post: Post | undefined = undefined) {
    super(post)
    
    if (!post) return

    this.animatedPreviewUrl = post.animatedPreviewUrl
  }

  static addToHistory(history: ProgressContext, posts: PostListVM[]) {
    const ids = posts.map(post => post.id)
    history.addPostIds(ids)
  }

  static consume(results: unknown[]) {
    return this.consumable(PostListVM, results)
  }
}

export class PostShowVM extends PostBaseVM {
  declare body: string | null
  declare author: UserVM
  declare videoTypeId: VideoTypes | null
  declare isLive: boolean
  declare isPublished: boolean
  declare isViewable: boolean
  declare isNotViewable: boolean
  declare isPaywalled: boolean
  declare paywallTimeAgo: string | undefined | null
  declare paywallDaysRemaining: number
  declare transcriptUrl: string | undefined
  declare viewCount: number | null
  declare hasVideo: boolean
  declare streamId: string
  declare videoId: string | null
  declare livestreamUrl: string | null
  declare rootSortOrder: number

  constructor(post: Post | undefined = undefined) {
    super(post)

    if (!post) return

    this.body = post.body
    this.videoTypeId = post.videoTypeId
    this.isPublished = post.isPublished
    this.isViewable = post.isViewable
    this.isNotViewable = post.isNotViewable
    this.isPaywalled = post.isPaywalled
    this.paywallTimeAgo = post.paywallTimeAgo
    this.paywallDaysRemaining = post.paywallDaysRemaining
    this.transcriptUrl = post.transcriptUrl
    this.viewCount = post.viewCount
    this.hasVideo = !!post.hasVideo
    this.streamId = post.streamId
    this.videoId = post.videoId
    this.livestreamUrl = post.livestreamUrl
    this.author = new UserVM(post.authors.at(0)!)
  }

  static addToHistory(history: ProgressContext, post: PostShowVM) {
    history.addPostIds([post.id])
  }

  static consume(result: unknown) {
    return this.consumable(PostShowVM, [result])[0]
  }
}
