import LessonRequestSorts from '#enums/lesson_request_sorts'
import States from '#enums/states'
import SanitizeService from '#services/sanitize_service'
import vine from '@vinejs/vine'

export const lessonRequestSearchValidator = vine.create({
  pattern: vine.string().trim().optional(),
  state: vine.enum(Object.values(States).map((s) => s.toString())).optional(),
  sortBy: vine.enum(Object.values(LessonRequestSorts)).optional(),
})

export const lessonRequestStoreValidator = vine.create({
  name: vine.string().minLength(10).maxLength(255),
  body: vine.string().transform((value) => SanitizeService.sanitize(value)),
  nonDuplicate: vine.accepted(),
})

export const lessonRequestUpdateStateValidator = vine.create({
  comment: vine.string().optional(),
})

export const lessonRequestUpdateValidator = vine.create({
  name: vine.string().minLength(10).maxLength(255),
  body: vine.string().transform((value) => SanitizeService.sanitize(value)),
})
