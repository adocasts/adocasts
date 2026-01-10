import BaseAction from '#actions/base_action'
import { type ImageOptions } from '#services/asset_service'
import assetStorage from '#services/asset_storage_service'

export default class GetAsset extends BaseAction {
  async handle(options: ImageOptions) {
    if (options.shouldSkip) {
      return assetStorage.get(options.path)
    }

    if (await assetStorage.exists(options.tempPath)) {
      return assetStorage.get(options.tempPath)
    }

    await assetStorage.alter(options)

    return assetStorage.get(options.tempPath)
  }
}
