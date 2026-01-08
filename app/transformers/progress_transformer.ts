import type Progress from '#models/progress'
import { BaseTransformer } from '@adonisjs/core/transformers'

export default class ProgressTransformer extends BaseTransformer<Progress> {
  get #percent() {
    if (this.resource.isCompleted) {
      return 100
    }

    return this.resource.watchPercent || 0
  }

  toObject() {
    return {
      ...this.pick(this.resource, [
        'id',
        'userId',
        'postId',
        'collectionId',
        'readPercent',
        'watchPercent',
        'watchSeconds',
        'isCompleted',
        'hasActivity',
      ]),
      percent: this.#percent,
    }
  }
}
