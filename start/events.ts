import SessionLog from '#auth/models/session_log'
import Notification from '#notification/models/notification'
import User from '#user/models/user'
import emitter from '@adonisjs/core/services/emitter'
import { PostShowVM } from '../app/view_models/post.js'
const SessionListener = () => import('#auth/listeners/session_listener')
const PostListener = () => import('#post/listeners/post_listener')
const AccountListener = () => import('#user/listeners/account_listener')
const NotificationListener = () => import('#notification/listeners/notification_listener')

declare module '@adonisjs/core/types' {
  interface EventsList {
    'post:sync': { post: PostShowVM; views: number }
    'email:password_reset': { user: User; signedUrl: string }
    'email:password_reset_success': { user: User }
    'email:changed': { user: User; oldEmail: string; signedUrl: string }
    'email:reverted': { user: User }
    'email:new_device': { user: User; log: SessionLog }
    'email:email_verification': { user: User }
    'notification:send': { notification: Notification; user: User }
    'test': { test: string }
  }
}

emitter.on('session:migrated', [SessionListener, 'onMigrated'])
emitter.on('post:sync', [PostListener, 'onViewSync'])
emitter.on('email:password_reset', [AccountListener, 'onPasswordReset'])
emitter.on('email:password_reset_success', [AccountListener, 'onPasswordResetSuccess'])
emitter.on('email:changed', [AccountListener, 'onEmailChanged'])
emitter.on('email:reverted', [AccountListener, 'onEmailReverted'])
emitter.on('email:new_device', [AccountListener, 'onNewDevice'])
emitter.on('email:email_verification', [AccountListener, 'onVerifyEmail'])
emitter.on('notification:send', [NotificationListener, 'onSend'])
