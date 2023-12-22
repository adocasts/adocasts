import vine from '@vinejs/vine'

export const billtoValidator = vine.compile(
  vine.object({
    billToInfo: vine.string().maxLength(500).nullable().optional()
  })
)