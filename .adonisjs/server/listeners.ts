export const listeners = {
  AccountListener: () => import('#listeners/account_listener'),
  NotificationListener: () => import('#listeners/notification_listener'),
  PostListener: () => import('#listeners/post_listener'),
  SessionListener: () => import('#listeners/session_listener'),
}
