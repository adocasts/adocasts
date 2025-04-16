import SanitizeService from '#core/services/sanitize_service'
import vine from '@vinejs/vine'

export const discussionSearchValidator = vine.compile(
  vine.object({
    page: vine.number().positive().optional(),
    pattern: vine.string().trim().optional(),
    feed: vine.enum(['popular', 'noreplies', 'unsolved', 'solved']).optional(),
    topic: vine.string().optional(),
  })
)

export const discussionCreateValidator = vine.compile(
  vine.object({
    title: vine.string().trim().minLength(4).maxLength(100),
    body: vine
      .string()
      .trim()
      .minLength(4)
      .transform((value) => SanitizeService.sanitize(value)),
    taxonomyId: vine.number().positive().exists({ table: 'taxonomies', column: 'id' }).optional(),
  })
)
