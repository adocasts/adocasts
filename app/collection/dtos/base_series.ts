import AssetDto from '#asset/dtos/asset'
import BaseTopicDto from '#taxonomy/dtos/base_topic'
import Collection from '#collection/models/collection'
import BaseModelDto from '#core/dtos/base_model_dto'
import SeriesLesson from '#post/dtos/series_lesson'

export default class BaseSeriesDto extends BaseModelDto {
  static model = Collection

  declare id: number
  declare difficultyId: number | null
  declare name: string
  declare slug: string
  declare description: string
  declare asset: AssetDto | null
  declare topics: BaseTopicDto[]
  declare lessons: SeriesLesson[]
  declare meta: Record<string, any>

  constructor(series?: Collection) {
    if (!series) return

    super()

    this.id = series.id
    this.difficultyId = series.difficultyId
    this.name = series.name
    this.slug = series.slug
    this.description = series.description
    this.asset = series.asset
    this.topics = BaseTopicDto.fromArray(series.taxonomies)
    this.lessons = SeriesLesson.fromArray(series.postsFlattened)
    this.meta = series.$extras
  }
}
