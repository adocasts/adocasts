import LessonPanels from '#enums/lesson_panels'
import vine from '@vinejs/vine'

export const preferencesValidator = vine.create({
  isEnabledProfile: vine.accepted().optional(),
  isEnabledMiniPlayer: vine.accepted().optional(),
  isEnabledAutoplayNext: vine.accepted().optional(),
  isEnabledMentions: vine.accepted().optional(),
  defaultLessonPanel: vine.number().enum(LessonPanels).optional(),
})

export const preferencePatchValidator = vine.create({
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
