export interface StudioPermissions {
  canAccessDashboard: boolean;
  canAccessPosts: boolean;
  canManagePosts: boolean;
  canAccessSeries: boolean;
  canManageSeries: boolean;
  canAccessTopics: boolean;
  canManageTopics: boolean;
  canAccessComments: boolean;
  canManageComments: boolean;
  canAccessSettings: boolean;
  canManageSettings: boolean;
}

export interface Permissions {
  studio: StudioPermissions
}

export interface Settings {
  isAdmin: boolean,
  isAuthenticated: boolean,
  permissions: Permissions
}