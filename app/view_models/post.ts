import Post from "#models/post"
import BaseVM from "./base.js"
import type { ProgressContext } from "#start/context"
import { AssetVM } from "./asset.js"
import { TopicRelationListVM } from "./topic.js"
import User from "#models/user"

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
    super()

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

class AuthorVM {
  declare id: number
  declare name: string
  declare username: string
  declare avatarUrl: string
  declare biography: string | null
  declare location: string | null
  declare company: string | null
  declare website: string | null
  declare twitterUrl: string | null
  declare facebookUrl: string | null
  declare instagramUrl: string | null
  declare linkedinUrl: string | null
  declare youtubeUrl: string | null
  declare threadsUrl: string | null
  declare githubUrl: string | null

  constructor(user: User | undefined = undefined) {
    if (!user) return

    this.id = user.id
    this.name = user.profile.name || user.username
    this.username = user.username
    this.avatarUrl = user.avatarUrl
    this.biography = user.profile.biography
    this.location = user.profile.location
    this.company = user.profile.company
    this.website = user.profile.website
    this.twitterUrl = user.profile.twitterUrl
    this.facebookUrl = user.profile.facebookUrl
    this.instagramUrl = user.profile.instagramUrl
    this.linkedinUrl = user.profile.linkedinUrl
    this.youtubeUrl = user.profile.youtubeUrl
    this.threadsUrl = user.profile.threadsUrl
    this.githubUrl = user.profile.githubUrl
  }
}

export class PostShowVM extends PostBaseVM {
  declare body: string | null
  declare author: AuthorVM

  constructor(post: Post | undefined = undefined) {
    super(post)

    if (!post) return

    this.body = post.body
    this.author = new AuthorVM(post.authors.at(0)!)
  }
}
