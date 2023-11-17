import vine from '@vinejs/vine'

export const signInValidator = vine.compile(
  vine.object({
    uid: vine.string(),
    password: vine.string(),
    rememberMe: vine.accepted(),
    forward: vine.string().optional(),
    action: vine.string().optional(),
    plan: vine.string().optional()//.unique({ table: 'plans', column: 'slug' })
  })
)