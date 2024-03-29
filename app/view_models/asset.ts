import Asset from "#models/asset";

export default class AssetVM {
  static get(asset: Asset) {
    return {
      id: asset.id,
      assetTypeId: asset.assetTypeId,
      assetUrl: asset.assetUrl,
      filename: asset.filename,
      altText: asset.altText,
      credit: asset.credit
    }
  }
}
