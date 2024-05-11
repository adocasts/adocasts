import Taxonomy from "#models/taxonomy";
import { ProgressContext } from "#start/context";
import { AssetVM } from "./asset.js";
import BaseVM from "./base.js";
import { PostListVM } from "./post.js";
import { SeriesListVM } from "./series.js";

export class TopicRelationListVM {
  declare id: number
  declare name: string
  declare slug: string

  constructor(taxonomy: Taxonomy) {
    if (!taxonomy) return

    this.id = taxonomy.id
    this.name = taxonomy.name
    this.slug = taxonomy.slug
  }
}

export class TopicBaseVM extends BaseVM {
  declare id: number
  declare parentId: number | null
  declare name: string
  declare slug: string
  declare description: string
  declare isFeatured: boolean
  declare asset: AssetVM | null
  declare collections: SeriesListVM[] | null
  declare meta: Record<string, any>

  constructor(topic: Taxonomy | undefined = undefined) {
    super()

    if (!topic) return

    this.id = topic.id
    this.parentId = topic.parentId
    this.name = topic.name
    this.slug = topic.slug
    this.description = topic.description
    this.isFeatured = topic.isFeatured
    this.asset = this.#getAsset(topic)
    this.collections = topic.collections?.map((collection) => new SeriesListVM(collection))
  }

  get collectionIds() {
    if (!this.collections) return []
    return this.collections.map(collection => collection.id)
  }

  #getAsset(topic: Taxonomy) {
    if (!topic.asset) return null
    return new AssetVM(topic.asset)
  }
}

export class TopicListVM extends TopicBaseVM {
  declare posts: PostListVM[] | null

  constructor(topic: Taxonomy | undefined = undefined) {
    super(topic) 

    if (!topic) return

    this.posts = topic.posts?.map((post) => new PostListVM(post))
    this.meta = {
      collectionsCount: topic.$extras.collections_count || 0,
      postsCount: topic.$extras.posts_count || 0,
      videoSecondsSum: topic.$extras.videoSecondsSum || 0,
    }
  }

  get postIds() {
    if (!this.posts) return []
    return this.posts.map(post => post.id)
  }

  static addToHistory(history: ProgressContext, results: TopicListVM[]) {
    const postIds = this.getPostIds(results)

    history.addPostIds(postIds)
  }

  static getPostIds(results: TopicListVM[]) {
    return results.reduce<number[]>((ids, topic) => [
      ...ids,
      ...(topic?.postIds || []),
    ], [])
  }

  static consume(results: unknown[]) {
    return this.consumable(TopicListVM, results)
  }
}
