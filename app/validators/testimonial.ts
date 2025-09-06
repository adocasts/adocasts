import vine from '@vinejs/vine'

export const testimonialValidator = vine.compile(
  vine.object({
    forward: vine.string().optional(),
    body: vine.string().trim().maxLength(750),
  })
)

export const testimonialPaginatorValidator = vine.compile(
  vine.object({
    page: vine
      .number()
      .parse((v) => v ?? 1)
      .positive()
      .optional(),
    perPage: vine
      .number()
      .parse((v) => v ?? 10)
      .positive()
      .max(50)
      .optional(),
  })
)
