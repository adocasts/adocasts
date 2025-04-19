import CommentPreviewDto from '#comment/dtos/comment_preview'
import BaseModelDto from '#core/dtos/base_model_dto'
import Discussion from '#discussion/models/discussion'
import TopicDto from '#taxonomy/dtos/topic'
import AuthorDto from '#user/dtos/author'
import DiscussionVoteDto from './discussion_vote.js'

export default class DiscussionListDto extends BaseModelDto {
  static model() {
    return Discussion
  }

  declare id: number
  declare title: string
  declare slug: string
  declare body: string
  declare createdAt: string
  declare updatedAt: string
  declare topic: TopicDto | null
  declare votes: DiscussionVoteDto[]
  declare comments: CommentPreviewDto[]
  declare author: AuthorDto | null
  declare meta: Record<string, any>

  constructor(discussion?: Discussion) {
    super()

    if (!discussion) return

    this.id = discussion.id
    this.title = discussion.title
    this.slug = discussion.slug
    this.body = discussion.body
    this.createdAt = discussion.createdAt?.toISO()!
    this.updatedAt = discussion.updatedAt?.toISO()!
    this.meta = discussion.$extras

    this.topic = TopicDto.fromModel(discussion.taxonomy)
    this.votes = DiscussionVoteDto.fromArray(discussion.votes)
    this.comments = CommentPreviewDto.fromArray(discussion.comments)
    this.author = AuthorDto.fromModel(discussion.user)
  }
}
