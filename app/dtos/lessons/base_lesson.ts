import AssetDto from '../asset.js'
import Post from '#models/post'
import BaseModelDto from '../base_dto.js'

export default class BaseLessonDto extends BaseModelDto {
  static model = () => Post

  declare id: number
  declare slug: string
  declare title: string
  declare postTypeId: number
  declare paywallTypeId: number
  declare stateId: number
  declare publishAt?: string | null
  declare routeUrl: string
  declare watchMinutes: string
  declare asset: AssetDto | null
  declare meta: Record<string, any>

  constructor(post?: Post) {
    super()

    if (!post) return

    this.id = post.id
    this.slug = post.slug
    this.title = post.title
    this.postTypeId = post.postTypeId
    this.paywallTypeId = post.paywallTypeId
    this.stateId = post.stateId
    this.publishAt = post.publishAt?.toISO()
    this.routeUrl = post.routeUrl
    this.watchMinutes = post.watchMinutes
    this.asset = AssetDto.fromModel(post.assets?.at(0))
    this.meta = post.$extras
  }
}
