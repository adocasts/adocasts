import BaseAction from '#actions/base_action'
import Progress from '#models/progress'
import { progressValidator } from '#validators/history'
import { Infer } from '@vinejs/vine/types'

type Validator = Infer<typeof progressValidator>

export default class GetOrCreateProgress extends BaseAction {
  async handle(userId: number, data: Validator) {
    const query: Partial<Progress> = { userId }

    if (data.postId) query.postId = data.postId

    return Progress.firstOrNew(query, { userId })
  }
}
