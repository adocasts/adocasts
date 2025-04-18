import CommentVote from '#comment/models/comment_vote'
import BaseModelDto from '#core/dtos/base_model_dto'

export default class CommentVoteDto extends BaseModelDto {
  static selectExtras = ['user_id']

  declare id: number
  declare userId: number

  constructor(vote?: CommentVote) {
    super()

    if (!vote) return

    this.id = vote.id
    this.userId = vote.$extras?.pivot_user_id
  }
}
