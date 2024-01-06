import vine from '@vinejs/vine'

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

