import User from '#user/models/user'
import { BasePolicy as BouncerBasePolicy } from '@adonisjs/bouncer'
import Roles from '#core/enums/roles'

export default class BasePolicy extends BouncerBasePolicy {
  protected isAdmin(user: User | null) {
    return user?.roleId === Roles.ADMIN
  }

  protected isContributorLvl1(user: User | null) {
    return user?.roleId === Roles.CONTRIBUTOR_LVL_1
  }

  protected isContributorLvl2(user: User | null) {
    return user?.roleId === Roles.CONTRIBUTOR_LVL_2
  }

  protected isAuthenticated(user: User | null) {
    return !!user
  }
}
