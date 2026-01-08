import type PostChapter from '#models/post_chapter'
import { BaseTransformer } from '@adonisjs/core/transformers'

export default class PostChapterTransformer extends BaseTransformer<PostChapter> {
  toObject() {
    return this.pick(this.resource, ['id', 'startSeconds', 'endSeconds', 'text', 'sortOrder'])
  }
}
