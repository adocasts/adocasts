import LessonPanels from '#enums/lesson_panels'
import Sorts from '#enums/sorts'
import vine from '@vinejs/vine'

export const postSearchValidator = vine.create({
  page: vine
    .number()
    .parse((v) => v ?? 1)
    .positive()
    .optional(),
  perPage: vine
    .number()
    .parse((v) => v ?? 18)
    .positive()
    .max(50)
    .optional(),
  pattern: vine.string().trim().optional(),
  sort: vine.enum(Sorts).optional(),
  topics: vine.array(vine.string()).optional(),
})

export const defaultPostPanelValidator = vine.create({
  panel: vine.number().enum(LessonPanels),
})
