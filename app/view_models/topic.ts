import Taxonomy from "#models/taxonomy";
import { ProgressContext } from "#start/context";
import { AssetVM } from "./asset.js";
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

export class TopicListVM {
  declare id: number
  declare name: string
  declare slug: string
  declare description: string
  declare asset: AssetVM | null
  declare posts: PostListVM[] | null
  declare collections: SeriesListVM[] | null
  declare meta: Record<string, any>

  get postIds() {
    if (!this.posts) return []
    return this.posts.map(post => post.id)
  }

  get collectionIds() {
    if (!this.collections) return []
    return this.collections.map(collection => collection.id)
  }

  constructor(topic: Taxonomy) {
    this.id = topic.id
    this.name = topic.name
    this.slug = topic.slug
    this.description = topic.description
    this.asset = this.#getAsset(topic)
    this.posts = topic.posts?.map((post) => new PostListVM(post))
    this.collections = topic.collections?.map((collection) => new SeriesListVM(collection))
    this.meta = {
      collectionsCount: topic.$extras.collections_count || 0,
      postsCount: topic.$extras.posts_count || 0
    }
  }

  #getAsset(topic: Taxonomy) {
    if (!topic.asset) return null
    return new AssetVM(topic.asset)
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
}



export class TopicShowVM {
  declare id: number
  declare name: string
  declare slug: string
  declare description: string
  declare asset: AssetVM | null
  declare lessons: PostListVM[] | null
  declare snippets: PostListVM[] | null
  declare collections: SeriesListVM[] | null
  declare meta: Record<string, any>

  get postIds() {
    if (!this.lessons && !this.snippets) return []
    return [...(this.lessons || []), ...(this.snippets || [])].map(post => post.id)
  }

  get collectionIds() {
    if (!this.collections) return []
    return this.collections.map(collection => collection.id)
  }

  constructor(topic: Taxonomy) {
    this.id = topic.id
    this.name = topic.name
    this.slug = topic.slug
    this.description = topic.description
    this.asset = this.#getAsset(topic)
    this.lessons = topic.less?.map((post) => new PostListVM(post))
    this.collections = topic.collections?.map((collection) => new SeriesListVM(collection))
    this.meta = {
      collectionsCount: topic.$extras.collections_count || 0,
      postsCount: topic.$extras.posts_count || 0
    }
  }

  #getAsset(topic: Taxonomy) {
    if (!topic.asset) return null
    return new AssetVM(topic.asset)
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
}
