import BaseHttpService from "./BaseHttpService"
import RoleEnum from 'App/Enums/Roles'

export default class SettingsService extends BaseHttpService {
  public get isAdmin() {
    return this.user?.roleId === RoleEnum.ADMIN
  }

  // @deprecated use bouncer instead
  public get permissions() {
    return {
      studio: {
        canAccessDashboard: this.isAuthenticated,

        canAccessPosts: this.isAdmin,
        canManagePosts: this.isAdmin,

        canAccessSeries: this.isAdmin,
        canManageSeries: this.isAdmin,

        canAccessTopics: this.isAdmin,
        canManageTopics: this.isAdmin,

        canAccessComments: this.isAuthenticated,
        canManageComments: this.isAuthenticated,

        canAccessSettings: this.isAuthenticated,
        canManageSettings: this.isAuthenticated
      }
    }
  }

  public build() {
    return {
      isAdmin: this.isAdmin,
      isAuthenticated: this.isAuthenticated,
      permissions: this.permissions
    }
  }
}
