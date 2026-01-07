import vine from '@vinejs/vine'

export const noteStoreValidator = vine.create({
  postId: vine.number().exists({ table: 'posts', column: 'id' }),
  timestampSeconds: vine.number().optional(),
  atTimestamp: vine.boolean().optional(),
  body: vine.string(),
})

export const noteUpdateValidator = vine.create({
  forward: vine.string().optional().nullable(),
  postId: vine.number().exists({ table: 'posts', column: 'id' }),
  timestampSeconds: vine.number().optional().nullable(),
  atTimestamp: vine.boolean().optional().nullable(),
  body: vine.string(),
})
