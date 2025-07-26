import AssetDto from './asset.js'
import BaseModelDto from '#dtos/base_model_dto'
import Taxonomy from '#models/taxonomy'

export default class TopicDto extends BaseModelDto {
  static model() {
    return Taxonomy
  }

  declare id: number
  declare parentId: number | null
  declare name: string
  declare abbrev: string
  declare slug: string
  declare description: string
  declare isFeatured: boolean
  declare asset: AssetDto | null
  declare children: TopicDto[]
  declare meta: Record<string, any>

  constructor(topic?: Taxonomy) {
    if (!topic) return

    super()

    this.id = topic.id
    this.parentId = topic.parentId
    this.name = topic.name
    this.abbrev = topic.abbrev
    this.slug = topic.slug
    this.description = topic.description
    this.isFeatured = topic.isFeatured
    this.asset = topic.asset && new AssetDto(topic.asset)
    this.children = TopicDto.fromArray(topic.children)
    this.meta = topic.$extras
  }
}
