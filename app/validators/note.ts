import vine from '@vinejs/vine'

export const noteStoreValidator = vine.compile(
  vine.object({
    postId: vine.number().exists({ table: 'posts', column: 'id' }),
    timestampSeconds: vine.number().optional(),
    atTimestamp: vine.boolean().optional(),
    body: vine.string().optional(),
  })
)

export const noteUpdateValidator = vine.compile(
  vine.object({
    postId: vine.number().exists({ table: 'posts', column: 'id' }),
    timestampSeconds: vine.number().optional().nullable(),
    atTimestamp: vine.boolean().optional().nullable(),
    body: vine.string().optional(),
  })
)
