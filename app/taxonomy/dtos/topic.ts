import AssetDto from '#asset/dtos/asset'
import BaseModelDto from '#core/dtos/base_model_dto'
import Taxonomy from '#taxonomy/models/taxonomy'

export default class TopicDto extends BaseModelDto {
  static model() {
    return Taxonomy
  }

  declare id: number
  declare parentId: number | null
  declare name: string
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
    this.slug = topic.slug
    this.description = topic.description
    this.isFeatured = topic.isFeatured
    this.asset = topic.asset && new AssetDto(topic.asset)
    this.children = TopicDto.fromArray(topic.children)
    this.meta = topic.$extras
  }
}
