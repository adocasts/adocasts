import User from '#models/user'
import BasePolicy from './base_policy.js'
import { AuthorizerResponse } from '@adonisjs/bouncer/types'

export default class AssetPolicy extends BasePolicy {
  public before(user: User) {
    if (this.isAdmin(user)) return true
  }
  
  store(user: User): AuthorizerResponse {
    return !user.isFreeTier
  }
  
}