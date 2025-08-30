import BaseAction from '#actions/base_action'
import NotImplementedException from '#exceptions/not_implemented_exception'
import CommentVote from '#models/comment_vote'
import DiscussionVote from '#models/discussion_vote'
import RequestVote from '#models/request_vote'

type Types = 'discussion' | 'comment' | 'request'

export default class ToggleVote extends BaseAction {
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
