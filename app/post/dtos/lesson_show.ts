import AssetDto from '#asset/dtos/asset'
import LessonSeriesDto from '#collection/dtos/lesson_series'
import CommentDto from '#comment/dtos/comment'
import BaseModelDto from '#core/dtos/base_model_dto'
import Post from '#post/models/post'
import AuthorDto from '#user/dtos/author'
import CaptionDto from './caption.js'
import ChapterDto from './chapter.js'

export default class LessonShowDto extends BaseModelDto {
  static model() {
    return Post
  }

  declare id: number
  declare slug: string
  declare title: string
  declare description: string | null
  declare postTypeId: number
  declare paywallTypeId: number
  declare stateId: number
  declare publishAt?: string | null
  declare routeUrl: string
  declare body: string | null
  declare videoSeconds: number
  declare thumbnail: AssetDto | null
  declare author: AuthorDto | null
  declare captions: CaptionDto[] | null
  declare chapters: ChapterDto[] | null
  declare series: LessonSeriesDto[]
  declare seriesParents: LessonSeriesDto[]
  declare comments: CommentDto[]
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
    this.body = post.body
    this.videoSeconds = post.videoSeconds
    this.thumbnail = AssetDto.fromModel(post.thumbnails?.at(0))
    this.author = AuthorDto.fromModel(post.authors?.at(0))
    this.captions = CaptionDto.fromArray(post.captions)
    this.chapters = ChapterDto.fromArray(post.chapters)
    this.series = LessonSeriesDto.fromArray(post.rootSeries)
    this.seriesParents = LessonSeriesDto.fromArray(post.series)
    this.comments = CommentDto.fromArray(post.comments)
    this.meta = post.$extras
  }
}
