import type Testimonial from '#models/testimonial'
import { BaseTransformer } from '@adonisjs/core/transformers'
import UserTransformer from './user_transformer.ts'

export default class TestimonialTransformer extends BaseTransformer<Testimonial> {
  toObject() {
    return {
      ...this.pick(this.resource, [
        'id',
        'userId',
        'body',
        'createdAt',
        'updatedAt',
        'rejectedAt',
        'staleAt',
        '$extras',
      ]),
      author: UserTransformer.transform(this.resource.user),
    }
  }
}
