import AssetDto from '#asset/dtos/asset'
import ProgressableDto from '#core/dtos/progressable_dto'
import Post from '#post/models/post'
import ProgressTypes from '#progress/enums/progress_types'

export default class SeriesLessonDto extends ProgressableDto {
  static model() {
    return Post
  }

  progressType = ProgressTypes.POST

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
  declare lessonIndexDisplay: string
  declare rootIndexDisplay: string
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
    this.lessonIndexDisplay = post.lessonIndexDisplay
    this.rootIndexDisplay = post.rootIndexDisplay
    this.meta = post.$extras
  }
}
