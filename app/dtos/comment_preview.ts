import Comment from '#models/comment'
import BaseModelDto from '#dtos/base_model_dto'
import AuthorDto from './author.js'

export default class CommentPreviewDto extends BaseModelDto {
  static model() {
    return Comment
  }

  declare id: number
  declare userId: number | null
  declare commentTypeId: number
  declare stateId: number
  declare author: AuthorDto | null
  declare createdAt: string

  constructor(comment?: Comment) {
    super()

    if (!comment) return

    this.id = comment.id
    this.userId = comment.userId
    this.commentTypeId = comment.commentTypeId
    this.stateId = comment.stateId
    this.author = AuthorDto.fromModel(comment.user)
    this.createdAt = comment.createdAt?.toISO()!
  }
}
