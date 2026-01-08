import type Collection from '#models/collection'
import { BaseTransformer } from '@adonisjs/core/transformers'
import PostTransformer from './post_transformer.ts'

export default class ModuleTransformer extends BaseTransformer<Collection> {
  toObject() {
    return {
      ...this.pick(this.resource, ['id', 'name', 'slug', 'moduleNumber']),
      lessons: PostTransformer.transform(this.whenLoaded(this.resource.posts)),
    }
  }
}
