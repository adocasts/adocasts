import CommentPreviewDto from './comment_preview.js'
import BaseModelDto from '#dtos/base_model_dto'
import Discussion from '#models/discussion'
import TopicDto from './topic.js'
import AuthorDto from './author.js'
import DiscussionVoteDto from '#dtos/discussion_vote'

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
  declare userVotes: number[]
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
    this.userVotes = discussion.votes?.map((vote) => vote.userId) ?? []
    this.meta = discussion.$extras

    this.topic = TopicDto.fromModel(discussion.taxonomy)
    this.comments = CommentPreviewDto.fromArray(discussion.comments)
    this.author = AuthorDto.fromModel(discussion.user)
  }
}
