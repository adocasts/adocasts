import type Taxonomy from '#models/taxonomy'
import { BaseTransformer } from '@adonisjs/core/transformers'
import AssetTransformer from './asset_transformer.ts'

export default class TaxonomyTransformer extends BaseTransformer<Taxonomy> {
  toObject() {
    return {
      ...this.pick(this.resource, [
        'id',
        'parentId',
        'name',
        'abbrev',
        'slug',
        'description',
        'isFeatured',
        '$extras',
      ]),
      asset: AssetTransformer.transform(this.whenLoaded(this.resource.asset)),
      children: TaxonomyTransformer.transform(this.whenLoaded(this.resource.children)),
    }
  }
}
