import vine from '@vinejs/vine'

export const topicPaginatorValidator = vine.create({
  page: vine
    .number()
    .parse((v) => v ?? 1)
    .positive()
    .optional(),
  perPage: vine
    .number()
    .parse((v) => v ?? 18)
    .positive()
    .max(50)
    .optional(),
})
