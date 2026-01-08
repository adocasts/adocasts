import type Comment from '#models/comment'
import { BaseTransformer } from '@adonisjs/core/transformers'
import UserTransformer from './user_transformer.ts'

export default class CommentTransformer extends BaseTransformer<Comment> {
  toObject() {
    return {
      ...this.pick(this.resource, [
        'id',
        'userId',
        'commentTypeId',
        'commentableId',
        'replyTo',
        'name',
        'body',
        'stateId',
        'levelIndex',
        'createdAt',
        'updatedAt',
      ]),
      author: UserTransformer.transform(this.whenLoaded(this.resource.user)),
    }
  }

  preview() {
    return {
      ...this.pick(this.resource, ['id', 'userId', 'commentTypeId', 'stateId', 'createdAt']),
      author: UserTransformer.transform(this.whenLoaded(this.resource.user)),
    }
  }
}
