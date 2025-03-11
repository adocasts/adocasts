import AssetDto from '../asset.js'
import Taxonomy from '#models/taxonomy'
import BaseModelDto from '../base_model_dto.js'

export default class BaseTopicDto extends BaseModelDto {
  static model = Taxonomy

  declare id: number
  declare parentId: number | null
  declare name: string
  declare slug: string
  declare description: string
  declare isFeatured: boolean
  declare asset: AssetDto | null
  declare meta: Record<string, any>

  constructor(topic?: Taxonomy) {
    if (!topic) return

    super()

    this.id = topic.id
    this.parentId = topic.parentId
    this.name = topic.name
    this.slug = topic.slug
    this.description = topic.description
    this.isFeatured = topic.isFeatured
    this.asset = topic.asset && new AssetDto(topic.asset)
    this.meta = topic.$extras
  }
}
