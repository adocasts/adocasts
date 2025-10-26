import vine from '@vinejs/vine'

export const noteValidator = vine.compile(
  vine.object({
    postId: vine.number().exists({ table: 'posts', column: 'id' }),
    timestampSeconds: vine.number().optional(),
    atTimestamp: vine.boolean().optional(),
    body: vine.string().optional(),
  })
)
