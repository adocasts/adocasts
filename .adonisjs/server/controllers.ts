export const controllers = {
  NewAccount: () => import('#controllers/new_account_controller'),
  Series: () => import('#controllers/series_controller'),
  Session: () => import('#controllers/session_controller'),
}
