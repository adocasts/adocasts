import ProgressableDto from '#dtos/progressable_dto'
import ProgressTypes from '#enums/progress_types'
import Post from '#models/post'

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
  // declare animatedPreviewUrl?: string
  // declare thumbnail: AssetDto | null
  declare sortOrder: number
  declare rootSortOrder: string
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
    // this.animatedPreviewUrl = post.animatedPreviewUrl
    // this.thumbnail = AssetDto.fromModel(post.thumbnails?.at(0))
    this.sortOrder = post.$extras?.pivot_sort_order
    this.rootSortOrder = post.$extras?.pivot_root_sort_order + 1
    this.meta = post.$extras
  }
}
