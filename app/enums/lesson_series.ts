import AssetDto from '../dtos/asset.js'
import Collection from '#models/collection'
import BaseModelDto from '#dtos/base_model_dto'

export default class LessonSeriesDto extends BaseModelDto {
  static selectExtras: string[] = ['assetId']

  static model() {
    return Collection
  }

  declare id: number
  declare parentId: number | null
  declare name: string
  declare slug: string
  declare sortOrder: number
  declare asset: AssetDto | null
  declare meta: Record<string, any>

  constructor(series?: Collection) {
    super()

    if (!series) return

    this.id = series.id
    this.parentId = series.parentId
    this.name = series.name
    this.slug = series.slug
    this.sortOrder = series.sortOrder
    this.asset = AssetDto.fromModel(series.asset)
    this.meta = series.$extras
  }
}
