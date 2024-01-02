import vine from '@vinejs/vine'

export const advertisementEventValidator = vine.compile(
  vine.object({
    category: vine.string().maxLength(50).optional(),
    action: vine.string().maxLength(50).optional(),
  })
)