import CommentVote from '#comment/models/comment_vote'
import DiscussionVote from '#discussion/models/discussion_vote'
import RequestVote from '#lesson_request/models/request_vote'
import BaseModelDto from './base_model_dto.js'

export default class BaseVoteDto extends BaseModelDto {
  declare id: number
  declare userId: number

  constructor(vote?: DiscussionVote | CommentVote | RequestVote) {
    super()

    if (!vote) return

    this.id = vote.id
    this.userId = vote.$extras?.pivot_user_id
  }
}
