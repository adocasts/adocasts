import User from '#user/models/user'
import BasePolicy from '#core/policies/base_policy'
import { AuthorizerResponse } from '@adonisjs/bouncer/types'

export default class AssetPolicy extends BasePolicy {
  before(user: User) {
    if (this.isAdmin(user)) return true
  }

  store(user: User): AuthorizerResponse {
    return !user.isFreeTier
  }
}
