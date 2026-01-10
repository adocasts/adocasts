import htmlHelpers from '#services/helpers/html'
import vine from '@vinejs/vine'

export const discussionSearchValidator = vine.create({
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
  userId: vine.number().exists({ table: 'users', column: 'id' }).optional(),
  pattern: vine.string().trim().optional(),
  feed: vine.enum(['none', 'popular', 'noreplies', 'unsolved', 'solved']).optional(),
  topics: vine.array(vine.string()).optional(),
})

export const discussionValidator = vine.create({
  title: vine.string().trim().minLength(4).maxLength(100),
  body: vine
    .string()
    .trim()
    .minLength(4)
    .transform((value) => htmlHelpers.sanitize(value)),
  taxonomyId: vine.number().positive().exists({ table: 'taxonomies', column: 'id' }).optional(),
})

export const discussionSolvedValidator = vine.create({
  commentId: vine.number().exists({ table: 'comments', column: 'id' }),
})

export const discussionVoteValidator = vine.create({
  params: vine.object({
    id: vine.number().exists({ table: 'discussions', column: 'id' }),
  }),
})
