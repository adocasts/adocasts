import User from '#models/user'
import Post from '#models/post'
import type { AuthorizerResponse } from '@adonisjs/bouncer/types'
import BasePolicy from './base_policy.js'
import { action } from '@adonisjs/bouncer'
import PaywallTypes from '#enums/paywall_types'
import { PostListVM, PostShowVM } from '../view_models/post.js'
import PostService from '#services/post_service'

export default class PostPolicy extends BasePolicy {
  @action({ allowGuest: true })
  view(user: User, post: Post | PostListVM | PostShowVM): AuthorizerResponse {
    if (user && !user.isFreeTier) return true
    if (post.paywallTypeId === PaywallTypes.NONE) return true
    if (post.paywallTypeId === PaywallTypes.FULL) return false

    return !PostService.getIsPaywalled(post)
  }

  @action({ allowGuest: true })
  viewFutureDated(user: User): AuthorizerResponse {
    if (this.isAdmin(user) || this.isContributorLvl1(user) || this.isContributorLvl2(user))
      return true
    return false
  }
}
