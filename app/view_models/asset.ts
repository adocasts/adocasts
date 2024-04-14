import Asset from "#models/asset"
import BaseVM from "./base.js"

export class AssetVM extends BaseVM {
  declare id: number
  declare assetTypeId: number
  declare assetUrl: string
  declare filename: string
  declare altText: string | null
  declare credit: string | null

  constructor(asset: Asset | undefined = undefined) {
    super()

    if (!asset) return

    this.id = asset.id
    this.assetTypeId = asset.assetTypeId
    this.assetUrl = asset.assetUrl
    this.filename = asset.filename
    this.altText = asset.altText
    this.credit = asset.credit
  }
}
