import AssetDto from '../asset.js'
import BaseTopicDto from '../topics/base_topic.js'
import Collection from '#models/collection'
import BaseModelDto from '../base_dto.js'

export default class BaseSeriesDto extends BaseModelDto {
  static model = () => Collection

  declare id: number
  declare difficultyId: number | null
  declare name: string
  declare slug: string
  declare description: string
  declare asset: AssetDto | null
  declare topics: BaseTopicDto[]
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
    this.meta = series.$extras
  }
}
