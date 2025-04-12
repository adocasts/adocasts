import BaseModelDto from '#core/dtos/base_model_dto'
import DiscussionVote from '#discussion/models/discussion_vote'

export default class DiscussionVoteDto extends BaseModelDto {
  static model() {
    return DiscussionVote
  }
}
