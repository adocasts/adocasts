import type Discussion from '#models/discussion'
import { BaseTransformer } from '@adonisjs/core/transformers'
import CommentTransformer from './comment_transformer.ts'
import TaxonomyTransformer from './taxonomy_transformer.ts'
import UserTransformer from './user_transformer.ts'

export default class DiscussionTransformer extends BaseTransformer<Discussion> {
  toObject() {
    return {
      ...this.pick(this.resource, [
        'id',
        'title',
        'slug',
        'body',
        'solvedAt',
        'createdAt',
        'updatedAt',
        '$extras',
      ]),
      author: UserTransformer.transform(this.resource.user),
      comments: CommentTransformer.transform(this.resource.comments).useVariant('preview'),
    }
  }

  show() {
    return {
      ...this.toObject(),
      ...this.pick(this.resource, ['stateId', 'solvedCommentId']),
      comments: CommentTransformer.transform(this.resource.comments),
      topic: TaxonomyTransformer.transform(this.resource.taxonomy),
    }
  }
}
