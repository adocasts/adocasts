import vine from '@vinejs/vine'
import { emailRule, usernameRule } from './auth.js'

export const updateUsernameValidator = vine.create({
  username: usernameRule,
})

export const updateEmailValidator = vine.create({
  email: emailRule,
  password: vine.string(),
})

export const emailNotificationValidator = vine.create({
  emailOnComment: vine.accepted().optional(),
  emailOnCommentReply: vine.accepted().optional(),
  emailOnAchievement: vine.accepted().optional(),
  emailOnNewDeviceLogin: vine.accepted().optional(),
  emailOnWatchlist: vine.accepted().optional(),
  emailOnMention: vine.accepted().optional(),
})

export const confirmUsernameValidator = vine.create({
  user_username: vine.string().trim().confirmed({ confirmationField: 'username' }),
})

export const githubTeamInviteValidator = vine.create({
  username: vine.string().trim(),
})
