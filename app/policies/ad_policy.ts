import User from '#models/user'
import { BasePolicy, allowGuest } from '@adonisjs/bouncer'
import type { AuthorizerResponse } from '@adonisjs/bouncer/types'

export default class AdPolicy extends BasePolicy {
  @allowGuest()
  view(user: User): AuthorizerResponse {
    return !user || user.isFreeTier
  }
}

