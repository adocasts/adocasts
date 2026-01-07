import vine from '@vinejs/vine'

export const advertisementEventValidator = vine.create({
  category: vine.string().maxLength(50).optional(),
  action: vine.string().maxLength(50).optional(),
})
