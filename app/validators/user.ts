import vine from '@vinejs/vine'

export const emailValidator = vine.compile(
  vine.object({
    email: vine.string().email(),
  })
)

export const billtoValidator = vine.compile(
  vine.object({
    billToInfo: vine.string().maxLength(500).nullable().optional(),
  })
)

export const mentionListValidator = vine.compile(
  vine.object({
    pattern: vine.string().trim().toLowerCase().optional(),
  })
)

export const userHistoryValidator = vine.compile(
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
