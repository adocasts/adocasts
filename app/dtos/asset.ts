import Asset from '#models/asset'
import BaseModelDto from './base_dto.js'

export default class AssetDto extends BaseModelDto {
  static model = () => Asset

  declare id: number
  declare assetTypeId: number
  declare filename: string
  declare altText: string | null
  declare credit: string | null
  declare assetUrl: string

  constructor(asset?: Asset) {
    super()

    if (!asset) return
    this.id = asset.id
    this.assetTypeId = asset.assetTypeId
    this.filename = asset.filename
    this.altText = asset.altText
    this.credit = asset.credit
    this.assetUrl = asset.assetUrl
  }
}
