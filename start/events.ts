const OnAuthenticationFailed = () => import('#actions/auth/on_authentication_failed')
import OnPendingEmailChange from '#listeners/account_listener'
import Notification from '#models/notification'
import SessionLog from '#models/session_log'
import User from '#models/user'
import emitter from '@adonisjs/core/services/emitter'
const PostListener = () => import('#listeners/post_listener')
const SessionListener = () => import('#listeners/session_listener')
const AccountListener = () => import('#listeners/account_listener')
const NotificationListener = () => import('#listeners/notification_listener')

declare module '@adonisjs/core/types' {
  interface EventsList {
    'post:sync': { postId: number; views: number }
    'email:password_reset': { user: User; signedUrl: string }
    'email:password_reset_success': { user: User }
    'email:change:attempted': OnPendingEmailChange
    'email:changed': { user: User; oldEmail: string; signedUrl: string }
    'email:reverted': { user: User }
    'email:new_device': { user: User; log: SessionLog }
    'email:email_verification': { user: User }
    'notification:send': { notification: Notification; user: User }
    'test': { test: string }
  }
}

// todo: migrate to actions
emitter.on('session:migrated', [SessionListener, 'onMigrated'])
emitter.on('post:sync', [PostListener, 'onViewSync'])
emitter.on('email:password_reset', [AccountListener, 'onPasswordReset'])
emitter.on('email:password_reset_success', [AccountListener, 'onPasswordResetSuccess'])
emitter.on('email:changed', [AccountListener, 'onEmailChanged'])
emitter.on('email:reverted', [AccountListener, 'onEmailReverted'])
emitter.on('email:new_device', [AccountListener, 'onNewDevice'])
emitter.on('email:email_verification', [AccountListener, 'onVerifyEmail'])
emitter.on('notification:send', [NotificationListener, 'onSend'])

// done: migrated to actions
// emitter.on('session_auth:login_succeeded', [OnSignInSucceeded, 'asListener'])
// emitter.on('session_auth:logged_out', [OnSignOutSucceeded, 'asListener'])
// emitter.on('session_auth:authentication_succeeded', [OnAuthenticationSucceeded, 'asListener'])
emitter.on('session_auth:authentication_failed', [OnAuthenticationFailed, 'asListener'])
