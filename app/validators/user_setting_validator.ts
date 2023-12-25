import vine from '@vinejs/vine'

export const emailNotificationValidator = vine.compile(
  vine.object({
    emailOnComment: vine.accepted().optional(),
    emailOnCommentReply: vine.accepted().optional(),
    emailOnAchievement: vine.accepted().optional(),
    emailOnNewDeviceLogin: vine.accepted().optional(),
    emailOnWatchlist: vine.accepted().optional()
  })
)

export const confirmUsernameValidator = vine.compile(
  vine.object({
    user_username: vine.string().trim().confirmed({ confirmationField: 'username' })
  })
)