import PaywallTypes from "#enums/paywall_types";
import Plans from "#enums/plans";
import Roles from "#enums/roles";
import Post from "#models/post";
import { inject } from "@adonisjs/core";
import { HttpContext } from "@adonisjs/core/http";

@inject()
export default class PermissionService {
  constructor(protected ctx: HttpContext) {}

  //#region Helpers

  public get user() {
    return this.ctx.auth.user
  }

  public get isAdmin() {
    return this.user?.isAdmin
  }

  public get isContributorLvl1() {
    return this.user?.roleId === Roles.CONTRIBUTOR_LVL_1
  }

  public get isContributorLvl2() {
    return this.user?.roleId === Roles.CONTRIBUTOR_LVL_2
  }

  public get isElevatedRole() {
    return this.isAdmin || this.isContributorLvl1 || this.isContributorLvl2
  }

  public get isPlus() {
    return this.user?.planId !== Plans.FREE
  }

  //#endregion

  //#region Post

  public canViewPost(post: Post) {
    if (this.user && this.user.planId !== Plans.FREE) return true
		if (post.paywallTypeId === PaywallTypes.NONE) return true
		if (post.paywallTypeId === PaywallTypes.FULL) return false
		
		return !post.isPaywalled
  }

  public canViewFutureDated() {
    return this.isElevatedRole
  }

  //#endregion
}