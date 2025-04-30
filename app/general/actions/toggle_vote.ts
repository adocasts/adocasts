import CommentVote from '#comment/models/comment_vote'
import NotImplementedException from '#core/exceptions/not_implemented_exception'
import DiscussionVote from '#discussion/models/discussion_vote'
import RequestVote from '#lesson_request/models/request_vote'
import BaseAction from '../../core/actions/base_action.js'

type Types = 'discussion' | 'comment' | 'request'

export default class ToggleVote extends BaseAction<[Types, number, number]> {
  async handle(type: Types, recordId: number, userId: number) {
    const { model, property } = await this.#getModel(type)
    const vote = await model.findBy({ id: recordId, userId })

    if (!vote) {
      await model.create({ userId, [property]: recordId })
    } else {
      await vote.delete()
    }

    return model.query().where(property, recordId).getCount()
  }

  #getModel(type: Types) {
    switch (type) {
      case 'discussion':
        return { model: DiscussionVote, property: 'discussionId' }
      case 'comment':
        return { model: CommentVote, property: 'commentId' }
      case 'request':
        return { model: RequestVote, property: 'lessonRequestId' }
      default:
        throw new NotImplementedException(`ToggleVote does not implement type: ${type}`)
    }
  }
}
