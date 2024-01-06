import vine from '@vinejs/vine'

export const historyValidator = vine.compile(
  vine.object({
    postId: vine.number().optional(),
    collectionId: vine.number().optional(),
    taxonomyId: vine.number().optional(),
    route: vine.string().trim(),
    readPercent: vine.number().positive().optional(),
    watchPercent: vine.number().positive().optional(),
    watchSeconds: vine.number().positive().optional(),
    isCompleted: vine.boolean().optional(),
  })
)

