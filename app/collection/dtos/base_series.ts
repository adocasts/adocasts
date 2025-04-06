import AssetDto from '#asset/dtos/asset'
import BaseTopicDto from '#taxonomy/dtos/base_topic'
import Collection from '#collection/models/collection'
import BaseModelDto from '#core/dtos/base_model_dto'
import SeriesLessonDto from '#post/dtos/series_lesson'

export default class BaseSeriesDto extends BaseModelDto {
  static model() {
    return Collection
  }

  declare id: number
  declare difficultyId: number | null
  declare name: string
  declare slug: string
  declare description: string
  declare asset: AssetDto | null
  declare topics: BaseTopicDto[]
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
    this.topics = BaseTopicDto.fromArray(series.taxonomies)
    this.lessons = SeriesLessonDto.fromArray(series.postsFlattened)
    this.meta = series.$extras
  }
}
