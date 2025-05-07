import Comment from '#comment/models/comment'
import BaseModelDto from '#core/dtos/base_model_dto'
import AuthorDto from '#user/dtos/author'

export default class CommentDto extends BaseModelDto {
  static model() {
    return Comment
  }

  declare id: number
  declare userId: number | null
  declare commentTypeId: number
  declare commentableId: number | null
  declare replyTo: number | null
  declare name: string
  declare body: string
  declare stateId: number
  declare author: AuthorDto | null
  declare levelIndex: number
  declare createdAt: string
  declare userVotes: number[]

  constructor(comment?: Comment) {
    super()

    if (!comment) return

    this.id = comment.id
    this.userId = comment.userId
    this.commentTypeId = comment.commentTypeId
    this.commentableId = comment.commentableId
    this.replyTo = comment.replyTo
    this.name = comment.name
    this.body = comment.body
    this.stateId = comment.stateId
    this.author = AuthorDto.fromModel(comment.user)
    this.levelIndex = comment.levelIndex
    this.createdAt = comment.createdAt?.toISO()!
    this.userVotes = comment.userVotes?.map((vote) => vote.id) ?? []
  }
}
