import BasePolicy from '#core/policies/base_policy'
import PaywallTypes from '#plan/enums/paywall_types'
import Post from '#post/models/post'
import User from '#user/models/user'
import { action } from '@adonisjs/bouncer'
import type { AuthorizerResponse } from '@adonisjs/bouncer/types'
// import { PostListVM, PostShowVM } from '../view_models/post.js'
// import PostService from '#services/post_service'

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
