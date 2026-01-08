import type Asset from '#models/asset'
import { BaseTransformer } from '@adonisjs/core/transformers'

export default class AssetTransformer extends BaseTransformer<Asset> {
  toObject() {
    return this.pick(this.resource, [
      'id',
      'assetTypeId',
      'filename',
      'altText',
      'credit',
      'assetUrl',
    ])
  }
}
