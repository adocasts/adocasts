import BaseModelDto from '#dtos/base_model_dto'
import DiscussionVote from '#models/discussion_vote'

export default class DiscussionVoteDto extends BaseModelDto {
  static selectExtras = ['user_id']

  declare id: number
  declare userId: number

  constructor(vote?: DiscussionVote) {
    super()

    if (!vote) return

    this.id = vote.id
    this.userId = vote.$extras?.pivot_user_id
  }
}
