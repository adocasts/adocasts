import Collection from "#models/collection";
import type { ProgressContext } from "#start/context";
import BaseVM from "./base.js";
import { AssetVM } from "./asset.js";
import { PostListVM } from "./post.js";
import { TopicRelationListVM } from "./topic.js";

class SeriesBaseVM extends BaseVM {
  declare id: number
  declare difficultyId: number | null
  declare name: string
  declare slug: string
  declare description: string
  declare asset: AssetVM | null

  constructor(series: Collection | undefined = undefined) {
    super()

    if (!series) return

    this.id = series.id
    this.difficultyId = series.difficultyId
    this.name = series.name
    this.slug = series.slug
    this.description = series.description
    this.asset = this.#getAsset(series)
  }

  #getAsset(collection: Collection) {
    if (!collection.asset) return null
    return new AssetVM(collection.asset)
  }
}

class ModuleListVM extends BaseVM {
  declare id: number
  declare name: string
  declare slug: string
  declare moduleNumber: number
  declare posts: PostListVM[] | null

  constructor(module: Collection) {
    super()

    this.id = module.id
    this.name = module.name
    this.slug = module.slug
    this.moduleNumber = module.sortOrder + 1
    this.posts = module.posts.map((post) => new PostListVM(post))
  }
}

export class SeriesListVM extends SeriesBaseVM {
  declare posts: PostListVM[] | null

  constructor(series: Collection) {
    super(series)

    this.posts = series.postsFlattened.map((post) => new PostListVM(post))
    this.meta = {
      postsCount: series.$extras.postsFlattened_count || 0,
      videoSecondsSum: series.$extras.videoSecondsSum || 0,
    }
  }

  get postIds() {
    if (!this.posts) return []
    return this.posts.map(post => post.id)
  }

  static addToHistory(history: ProgressContext, results: SeriesListVM[]) {
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

export class SeriesShowVM extends SeriesBaseVM {
  declare statusId: number
  declare repositoryUrl: string
  declare posts: PostListVM[] | null
  declare modules: ModuleListVM[]
  declare topics: TopicRelationListVM[]

  constructor(series: Collection | undefined = undefined) {
    super(series)

    if (!series) return

    this.statusId = series.statusId
    this.repositoryUrl = series.repositoryUrl
    this.topics = this.#getTopics(series)
    this.modules = series.children.map((module) => new ModuleListVM(module))
    this.posts = series.posts.map((post) => new PostListVM(post))
    this.meta = {
      postsCount: series.$extras.posts_count || 0,
      videoSecondsSum: series.$extras.videoSecondsSum || 0,
    }
  }

  get postIds() {
    if (!this.posts && !this.modules) return []
    
    const modulePostIds = this.modules.reduce<number[]>((acc, module) => [...acc, ...(module.posts?.map(post => post.id) || [])], [])
    const postIds = this.posts?.map(post => post.id) ?? []

    return [...modulePostIds, ...postIds]
  }

  #getTopics(series: Collection) {
    if (!series.taxonomies?.length) return []
    return series.taxonomies.map(topic => new TopicRelationListVM(topic))
  }

  static addToHistory(history: ProgressContext, result: SeriesShowVM) {
    history.addCollectionIds([result.id])
    history.addPostIds(result.postIds)
  }

  static consume(result: unknown) {
    return this.consumable(SeriesShowVM, [result])[0]
  }
}
