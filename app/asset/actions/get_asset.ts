import { ImageOptions } from '#asset/services/asset_service'
import assetStorage from '#asset/services/asset_storage_service'
import BaseAction from '#core/actions/base_action'

export default class GetAsset extends BaseAction<[ImageOptions]> {
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
