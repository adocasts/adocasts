import vine from '@vinejs/vine'

export const preferencesValidator = vine.compile(
  vine.object({
    isEnabledProfile: vine.accepted().optional(),
    isEnabledMiniPlayer: vine.accepted().optional(),
    isEnabledAutoplayNext: vine.accepted().optional(),
    isEnabledMentions: vine.accepted().optional(),
  })
)

