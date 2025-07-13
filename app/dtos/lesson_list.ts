import LessonSeriesDto from '#dtos/lesson_series'
import ProgressableDto from '#dtos/progressable_dto'
import ProgressTypes from '#enums/progress_types'
import Post from '#models/post'
import AssetDto from './asset.js'

export default class LessonListDto extends ProgressableDto {
  static selectExtras = ['videoTypeId', 'videoYouTubeId', 'videoUrl', 'videoBunnyId']

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
  declare thumbnail: AssetDto | null
  declare animatedPreviewUrl?: string
  declare series: LessonSeriesDto | null
  declare seriesParent: LessonSeriesDto | null
  declare meta: Record<string, any>

  get order() {
    const module = this.seriesParent

    if (!module) {
      return ''
    }

    // if not a module, use sort as major
    if (!module.parentId) {
      return `${module.meta.pivot_sort_order + 1}.0`
    }

    // otherwise, use module sort as major and lesson sort as minor
    return `${module.sortOrder + 1}.${module.meta.pivot_sort_order}`
  }

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
    this.animatedPreviewUrl = post.animatedPreviewUrl
    this.thumbnail = AssetDto.fromModel(post.thumbnails?.at(0))
    this.series = LessonSeriesDto.fromModel(post.rootSeries?.at(0))
    this.seriesParent = LessonSeriesDto.fromModel(post.series?.at(0))
    this.meta = post.$extras
  }
}
