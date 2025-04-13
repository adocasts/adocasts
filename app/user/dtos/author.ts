import BaseModelDto from '#core/dtos/base_model_dto'
import User from '#user/models/user'

export default class AuthorDto extends BaseModelDto {
  static model() {
    return User
  }

  declare id: number
  declare planId: number
  declare username: string
  declare avatarUrl: string
  declare isenabledProfile: boolean

  constructor(user?: User) {
    super()

    if (!user) return

    this.id = user.id
    this.planId = user.planId
    this.username = user.username
    this.avatarUrl = user.avatarUrl
    this.isenabledProfile = user.isEnabledProfile
  }
}
