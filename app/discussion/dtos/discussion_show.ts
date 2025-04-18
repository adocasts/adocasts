import CommentDto from '#comment/dtos/comment'
import Discussion from '#discussion/models/discussion'
import BaseDiscussionDto from './base_discussion.js'

export default class DiscussionShowDto extends BaseDiscussionDto {
  declare comments: CommentDto[]

  constructor(discussion?: Discussion) {
    super(discussion)

    if (!discussion) return

    this.comments = CommentDto.fromArray(discussion.comments)
  }
}
