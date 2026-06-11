import User from '#models/user'
import BasePolicy from '#policies/base_policy'
import { StripeService } from '#services/stripe_service'
import { AuthorizerResponse } from '@adonisjs/bouncer/types'

export default class AssetPolicy extends BasePolicy {
  before(user: User) {
    if (this.isAdmin(user)) return true
  }

  store(user: User): AuthorizerResponse {
    // Plus sunset: asset uploads opened to any authenticated user (route stays auth-gated)
    if (user && !StripeService.isActive) return true
    return !user.isFreeTier
  }
}
