import User from '#models/user'
import { BasePolicy } from '@adonisjs/bouncer'
import { AuthorizerResponse } from '@adonisjs/bouncer/types'

export default class AdPolicy extends BasePolicy {
  public view(user: User): AuthorizerResponse {
    return user.isFreeTier
  } 
}