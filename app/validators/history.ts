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

export const progressShowValidator = vine.compile(
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
    params: vine.object({
      tab: vine
        .enum(['series', 'lessons'])
        .parse((v) => v ?? 'series')
        .optional(),
    }),
  })
)
