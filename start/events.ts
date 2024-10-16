import emitter from "@adonisjs/core/services/emitter"
import User from "#models/user"
import SessionLog from "#models/session_log"
import Notification from "#models/notification"
import { PostShowVM } from "../app/view_models/post.js"
const SessionListener = () => import('#listeners/session_listener')
const PostListener = () => import("#listeners/post_listener")
const AccountListener = () => import('#listeners/account_listener')
const NotificationListener = () => import('#listeners/notification_listener')

declare module '@adonisjs/core/types' {
  interface EventsList {
    'post:sync': { post: PostShowVM, views: number }
    'email:password_reset': { user: User, signedUrl: string }
    'email:password_reset_success': { user: User }
    'email:changed': { user: User, oldEmail: string, signedUrl: string }
    'email:reverted': { user: User }
    'email:new_device': { user: User, log: SessionLog }
    'email:email_verification': { user: User }
    'notification:send': { notification: Notification, user: User }
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
