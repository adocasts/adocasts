import vine from '@vinejs/vine'

export const contactValidator = vine.compile(
  vine.object({
    name: vine.string().optional(),
    email: vine.string().trim().email(),
    subject: vine.string().trim(),
    body: vine.string().trim(),
  })
)

