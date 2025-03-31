import LessonRequestSorts from '#lesson_request/enums/lesson_request_sorts'
import States from '#core/enums/states'
import SanitizeService from '#core/services/sanitize_service'
import vine from '@vinejs/vine'

export const lessonRequestSearchValidator = vine.compile(
  vine.object({
    pattern: vine.string().trim().optional(),
    state: vine.enum(Object.values(States).map((s) => s.toString())).optional(),
    sortBy: vine.enum(Object.values(LessonRequestSorts)).optional(),
  })
)

export const lessonRequestStoreValidator = vine.compile(
  vine.object({
    name: vine.string().minLength(10).maxLength(255),
    body: vine.string().transform((value) => SanitizeService.sanitize(value)),
    nonDuplicate: vine.accepted(),
  })
)

export const lessonRequestUpdateStateValidator = vine.compile(
  vine.object({
    comment: vine.string().optional(),
  })
)

export const lessonRequestUpdateValidator = vine.compile(
  vine.object({
    name: vine.string().minLength(10).maxLength(255),
    body: vine.string().transform((value) => SanitizeService.sanitize(value)),
  })
)
