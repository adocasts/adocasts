import Roles from '#enums/roles'
import { inject } from '@adonisjs/core'
import { HttpContext } from '@adonisjs/core/http'

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

  //#endregion
}
