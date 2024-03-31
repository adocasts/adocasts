import vine from '@vinejs/vine'

export const progressValidator = vine.compile(
  vine.object({
    postId: vine.number().optional(),
    collectionId: vine.number().optional(),
    readPercent: vine.number().positive().optional(),
    watchPercent: vine.number().positive().optional(),
    watchSeconds: vine.number().positive().optional(),
    isCompleted: vine.boolean().optional(),
  })
)
