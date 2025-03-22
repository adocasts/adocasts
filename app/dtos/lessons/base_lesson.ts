import AssetDto from '../asset.js'
import Post from '#models/post'
import BaseModelDto from '../base_model_dto.js'

export default class BaseLessonDto extends BaseModelDto {
  static model = Post

  declare id: number
  declare slug: string
  declare title: string
  declare description: string | null
  declare postTypeId: number
  declare paywallTypeId: number
  declare stateId: number
  declare publishAt?: string | null
  declare routeUrl: string
  declare videoSeconds: number
  declare asset: AssetDto | null
  declare meta: Record<string, any>

  constructor(post?: Post) {
    super()

    if (!post) return

    this.id = post.id
    this.slug = post.slug
    this.title = post.title
    this.description = post.description
    this.postTypeId = post.postTypeId
    this.paywallTypeId = post.paywallTypeId
    this.stateId = post.stateId
    this.publishAt = post.publishAt?.toISO()
    this.routeUrl = post.routeUrl
    this.videoSeconds = post.videoSeconds
    this.asset = AssetDto.fromModel(post.assets?.at(0))
    this.meta = post.$extras
  }
}
