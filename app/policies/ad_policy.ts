import User from '#models/user'
import { StripeService } from '#services/stripe_service'
import { BasePolicy, allowGuest } from '@adonisjs/bouncer'
import type { AuthorizerResponse } from '@adonisjs/bouncer/types'

export default class AdPolicy extends BasePolicy {
  @allowGuest()
  view(user: User): AuthorizerResponse {
    if (!StripeService.isActive) return false // Plus sunset: ads-free perk opened to everyone
    return !user || user.isFreeTier
  }
}
