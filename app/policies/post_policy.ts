import User from '#models/user'
import Post from '#models/post'
import type { AuthorizerResponse } from '@adonisjs/bouncer/types'
import BasePolicy from './base_policy.js'
import { action } from '@adonisjs/bouncer'
import Plans from '#enums/plans'
import PaywallTypes from '#enums/paywall_types'

export default class PostPolicy extends BasePolicy {
  @action({ allowGuest: true })
  view(user: User, post: Post): AuthorizerResponse {
    if (user && user.planId !== Plans.FREE) return true
    if (post.paywallTypeId === PaywallTypes.NONE) return true
    if (post.paywallTypeId === PaywallTypes.FULL) return false

    return !post.isPaywalled
  }

  @action({ allowGuest: true })
  viewFutureDated(user: User): AuthorizerResponse {
    if (this.isAdmin(user) || this.isContributorLvl1(user) || this.isContributorLvl2(user))
      return true
    return false
  }
}

