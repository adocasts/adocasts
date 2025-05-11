import AssetDto from './asset.js'
import CommentDto from './comment.js'
import Post from '#models/post'
import AuthorDto from './author.js'
import CaptionDto from './caption.js'
import ChapterDto from './chapter.js'
import BaseModelDto from './base_model_dto.js'

export default class LessonShowDto extends BaseModelDto {
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
  declare body: string | null
  declare videoSeconds: number
  declare thumbnail: AssetDto | null
  declare author: AuthorDto | null
  declare captions: CaptionDto[] | null
  declare chapters: ChapterDto[] | null
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
    this.stateId = post.stateId
    this.publishAt = post.publishAt?.toISO()
    this.routeUrl = post.routeUrl
    this.body = post.body
    this.videoSeconds = post.videoSeconds
    this.thumbnail = AssetDto.fromModel(post.thumbnails?.at(0))
    this.author = AuthorDto.fromModel(post.authors?.at(0))
    this.captions = CaptionDto.fromArray(post.captions)
    this.chapters = ChapterDto.fromArray(post.chapters)
    this.comments = CommentDto.fromArray(post.comments)
    this.meta = post.$extras
  }
}
