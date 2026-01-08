import type PostCaption from '#models/post_caption'
import { BaseTransformer } from '@adonisjs/core/transformers'

export default class PostCaptionTransformer extends BaseTransformer<PostCaption> {
  toObject() {
    return this.pick(this.resource, ['id', 'type', 'label', 'language', 'filename', 'sortOrder'])
  }
}
