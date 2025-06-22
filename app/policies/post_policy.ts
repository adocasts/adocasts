import BasePolicy from '#policies/base_policy'
import PaywallTypes from '#enums/paywall_types'
import Post from '#models/post'
import User from '#models/user'
import { action } from '@adonisjs/bouncer'
import type { AuthorizerResponse } from '@adonisjs/bouncer/types'
import TimeService from '#services/time_service'
import LessonShowDto from '#dtos/lesson_show'

export default class PostPolicy extends BasePolicy {
  @action({ allowGuest: true })
  view(user: User, post: Post | LessonShowDto): AuthorizerResponse {
    if (user && !user.isFreeTier) return true
    if (post.paywallTypeId === PaywallTypes.NONE) return true
    if (post.paywallTypeId === PaywallTypes.FULL) return false

    return !TimeService.getIsPaywalled(post)
  }

  @action({ allowGuest: true })
  viewFutureDated(user: User): AuthorizerResponse {
    if (this.isAdmin(user) || this.isContributorLvl1(user) || this.isContributorLvl2(user))
      return true
    return false
  }
}
