import SanitizeService from '#services/sanitize_service'
import vine from '@vinejs/vine'

export const discussionSearchValidator = vine.compile(
  vine.object({
    page: vine
      .number()
      .parse((v) => v ?? 1)
      .positive()
      .optional(),
    perPage: vine
      .number()
      .parse((v) => v ?? 20)
      .positive()
      .max(50)
      .optional(),
    pattern: vine.string().trim().optional(),
    feed: vine.enum(['popular', 'noreplies', 'unsolved', 'solved']).optional(),
    topic: vine.string().optional(),
  })
)

export const discussionValidator = vine.compile(
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

export const discussionSolvedValidator = vine.compile(
  vine.object({
    commentId: vine.number().exists({ table: 'comments', column: 'id' }),
  })
)

export const discussionVoteValidator = vine.compile(
  vine.object({
    params: vine.object({
      id: vine.number().exists({ table: 'discussions', column: 'id' }),
    }),
  })
)
