import vine from '@vinejs/vine'

export const preferencesValidator = vine.compile(
  vine.object({
    isEnabledProfile: vine.accepted().optional(),
    isEnabledMiniPlayer: vine.accepted().optional(),
    isEnabledAutoplayNext: vine.accepted().optional(),
    isEnabledMentions: vine.accepted().optional(),
  })
)

export const preferencePatchValidator = vine.compile(
  vine.object({
    value: vine.accepted().optional(),

    params: vine.object({
      preference: vine
        .enum([
          'isEnabledProfile',
          'isEnabledMiniPlayer',
          'isEnabledAutoplayNext',
          'isEnabledMentions',
        ])
        .optional(),
    }),
  })
)
