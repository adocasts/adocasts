import AssetDto from './asset.js'
import LessonSeriesDto from '#dtos/lesson_series'
import CommentDto from './comment.js'
import ProgressableDto from '#dtos/progressable_dto'
import Post from '#models/post'
import ProgressTypes from '#enums/progress_types'
import AuthorDto from './author.js'
import CaptionDto from './caption.js'
import ChapterDto from './chapter.js'

export default class LessonShowDto extends ProgressableDto {
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
  declare videoTypeId: number | null
  declare videoUrl: string | null
  declare videoBunnyId: string | null
  declare videoYouTubeId: string | null
  declare videoR2Id: string | null
  declare videoId: string | null
  declare bunnyHlsUrl?: string
  declare transcriptUrl?: string
  declare hasVideo: boolean
  declare stateId: number
  declare publishAt?: string | null
  declare updatedContentAt?: string | null
  declare routeUrl: string
  declare repositoryUrl: string | null
  declare body: string | null
  declare livestreamUrl: string | null
  declare isLive: boolean
  declare videoSeconds: number
  declare thumbnail: AssetDto | null
  declare author: AuthorDto | null
  declare lessonIndexDisplay: string
  declare rootIndexDisplay: string
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
    this.videoTypeId = post.videoTypeId
    this.videoUrl = post.videoUrl
    this.videoBunnyId = post.videoBunnyId
    this.videoYouTubeId = post.videoYouTubeId
    this.videoR2Id = post.videoR2Id
    this.videoId = post.videoId
    this.bunnyHlsUrl = post.bunnyHlsUrl
    this.transcriptUrl = post.transcriptUrl
    this.hasVideo = !!post.hasVideo
    this.stateId = post.stateId
    this.publishAt = post.publishAt?.toISO()
    this.updatedContentAt = post.updatedContentAt?.toISO()
    this.routeUrl = post.routeUrl
    this.repositoryUrl = post.repositoryUrl
    this.body = post.body
    this.livestreamUrl = post.livestreamUrl
    this.isLive = !!post.isLive
    this.videoSeconds = post.videoSeconds
    this.lessonIndexDisplay = post.lessonIndexDisplay
    this.rootIndexDisplay = post.rootIndexDisplay
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
