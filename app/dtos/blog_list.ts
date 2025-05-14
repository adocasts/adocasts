import Post from '#models/post'
import AssetDto from './asset.js'
import BaseModelDto from './base_model_dto.js'
import TopicDto from './topic.js'

export default class BlogListDto extends BaseModelDto {
  static model() {
    return Post
  }

  declare id: number
  declare slug: string
  declare title: string
  declare description: string | null
  declare postTypeId: number
  declare stateId: number
  declare publishAt?: string | null
  declare routeUrl: string
  declare videoSeconds: number
  declare asset: AssetDto | null
  declare topics: TopicDto[]
  declare meta: Record<string, any>

  constructor(post?: Post) {
    super()

    if (!post) return

    this.id = post.id
    this.slug = post.slug
    this.title = post.title
    this.description = post.description
    this.postTypeId = post.postTypeId
    this.stateId = post.stateId
    this.publishAt = post.publishAt?.toISO()
    this.routeUrl = post.routeUrl
    this.videoSeconds = post.videoSeconds
    this.asset = AssetDto.fromModel(post.assets?.at(0))
    this.topics = TopicDto.fromArray(post.taxonomies)
    this.meta = post.$extras
  }
}
