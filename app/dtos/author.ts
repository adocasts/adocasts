import BaseModelDto from '#dtos/base_model_dto'
import User from '#models/user'

export default class AuthorDto extends BaseModelDto {
  static selectExtras = ['avatarUrl']

  static model() {
    return User
  }

  declare id: number
  declare planId: number
  declare username: string
  declare handle: string
  declare avatar?: string
  declare isEnabledProfile: boolean
  declare isFreeTier: boolean

  constructor(user?: User) {
    super()

    if (!user) return

    this.id = user.id
    this.planId = user.planId
    this.username = user.username
    this.handle = user.handle
    this.avatar = user.avatar
    this.isEnabledProfile = user.isEnabledProfile
    this.isFreeTier = user.isFreeTier
  }
}
