import Collection from '#collection/models/collection'
import SeriesLessonDto from '#post/dtos/series_lesson'
import ModuleDto from './module.js'
import BaseModelDto from '#core/dtos/base_model_dto'
import AssetDto from '#asset/dtos/asset'
import TopicDto from '#taxonomy/dtos/topic'

export class SeriesShowDto extends BaseModelDto {
  static model() {
    return Collection
  }

  declare id: number
  declare statusId: number
  declare difficultyId: number | null
  declare name: string
  declare slug: string
  declare description: string
  declare asset: AssetDto | null
  declare topics: TopicDto[]
  declare lessons: SeriesLessonDto[]
  declare repositoryUrl?: string
  declare youtubePlaylistUrl?: string
  declare modules: ModuleDto[]
  declare meta: Record<string, any>

  constructor(series?: Collection) {
    super()

    if (!series) return

    this.id = series.id
    this.difficultyId = series.difficultyId
    this.statusId = series.statusId
    this.name = series.name
    this.slug = series.slug
    this.description = series.description
    this.asset = series.asset
    this.topics = TopicDto.fromArray(series.taxonomies)
    this.lessons = SeriesLessonDto.fromArray(series.postsFlattened)
    this.repositoryUrl = series.repositoryUrl
    this.youtubePlaylistUrl = series.youtubePlaylistUrl
    this.modules = ModuleDto.fromArray(series.children)
    this.lessons = SeriesLessonDto.fromArray(series.posts)
    this.meta = series.$extras
  }
}
