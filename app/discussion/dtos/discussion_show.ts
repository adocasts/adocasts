import CommentDto from '#comment/dtos/comment'
import BaseModelDto from '#core/dtos/base_model_dto'
import Discussion from '#discussion/models/discussion'
import TopicDto from '#taxonomy/dtos/topic'
import AuthorDto from '#user/dtos/author'

export default class DiscussionShowDto extends BaseModelDto {
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
  declare author: AuthorDto | null
  declare comments: CommentDto[]
  declare userVotes: number[]
  declare meta: Record<string, any>

  showOp = true

  get authorId() {
    return this.author?.id
  }

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
    this.author = AuthorDto.fromModel(discussion.user)
    this.comments = CommentDto.fromArray(discussion.comments)
  }
}
