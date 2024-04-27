import PaywallTypes from '#enums/paywall_types'
import Plans from '#enums/plans'
import Roles from '#enums/roles'
import Post from '#models/post'
import { inject } from '@adonisjs/core'
import { HttpContext } from '@adonisjs/core/http'
import PostService from './post_service.js'

@inject()
export default class PermissionService {
  constructor(protected ctx: HttpContext) {}

  //#region Helpers

  get user() {
    return this.ctx.auth.user
  }

  get isAdmin() {
    return this.user?.isAdmin
  }

  get isContributorLvl1() {
    return this.user?.roleId === Roles.CONTRIBUTOR_LVL_1
  }

  get isContributorLvl2() {
    return this.user?.roleId === Roles.CONTRIBUTOR_LVL_2
  }

  get isElevatedRole() {
    return this.isAdmin || this.isContributorLvl1 || this.isContributorLvl2
  }

  get isPlus() {
    return this.user?.planId !== Plans.FREE
  }

  //#endregion

  //#region Post

  canViewPost(post: Post) {
    if (this.user && this.user.planId !== Plans.FREE) return true
    if (post.paywallTypeId === PaywallTypes.NONE) return true
    if (post.paywallTypeId === PaywallTypes.FULL) return false

    return !PostService.getIsPaywalled(post)
  }

  canViewFutureDated() {
    return this.isElevatedRole
  }

  //#endregion
}
