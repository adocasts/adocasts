import vine from '@vinejs/vine'
import { emailRule, usernameRule } from './auth.js'

export const updateUsernameValidator = vine.compile(
  vine.object({
    username: usernameRule,
  })
)

export const updateEmailValidator = vine.compile(
  vine.object({
    email: emailRule,
    password: vine.string(),
  })
)

export const emailNotificationValidator = vine.compile(
  vine.object({
    emailOnComment: vine.accepted().optional(),
    emailOnCommentReply: vine.accepted().optional(),
    emailOnAchievement: vine.accepted().optional(),
    emailOnNewDeviceLogin: vine.accepted().optional(),
    emailOnWatchlist: vine.accepted().optional(),
    emailOnMention: vine.accepted().optional(),
  })
)

export const confirmUsernameValidator = vine.compile(
  vine.object({
    user_username: vine.string().trim().confirmed({ confirmationField: 'username' }),
  })
)
