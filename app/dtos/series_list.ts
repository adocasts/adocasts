import AssetDto from './asset.js'
import TopicDto from './topic.js'
import Collection from '#models/collection'
import BaseModelDto from '#dtos/base_model_dto'
import SeriesLessonDto from './series_lesson.js'

export default class SeriesListDto extends BaseModelDto {
  static model() {
    return Collection
  }

  declare id: number
  declare difficultyId: number | null
  declare name: string
  declare slug: string
  declare description: string
  declare asset: AssetDto | null
  declare topics: TopicDto[]
  declare lessons: SeriesLessonDto[]
  declare meta: Record<string, any>

  constructor(series?: Collection) {
    super()

    if (!series) return

    this.id = series.id
    this.difficultyId = series.difficultyId
    this.name = series.name
    this.slug = series.slug
    this.description = series.description
    this.asset = series.asset
    this.topics = TopicDto.fromArray(series.taxonomies)
    this.lessons = SeriesLessonDto.fromArray(series.postsFlattened)
    this.meta = series.$extras
  }
}
