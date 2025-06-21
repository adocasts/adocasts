import vine from '@vinejs/vine'
import { exists, unique } from './helpers/db.js'
import env from '#start/env'
import app from '@adonisjs/core/services/app'

const host = new URL(env.get('APP_DOMAIN')).hostname

export const usernameRule = vine
  .string()
  .maxLength(50)
  .minLength(3)
  .regex(/^[a-zA-Z0-9-_.]+$/)
  .notIn([
    'admin',
    'super',
    'power',
    'adocasts',
    'adocast',
    'Adocasts',
    'AdoCasts',
    'AdoCast',
    'Adocast',
    'jagr',
    'jagrco',
    '_jagr',
    '_jagrco',
    'jagr_',
    'jagrco_',
    'jagr-co',
    'moderator',
    'public',
    'dev',
    'alpha',
    'mail',
  ])
  .unique(unique('users', 'username', { caseInsensitive: true }))

export const signInValidator = vine.compile(
  vine.object({
    uid: vine.string(),
    password: vine.string(),
    rememberMe: vine.accepted().optional(),
    forward: vine.string().url({ require_tld: app.inProduction, host_whitelist: [host] }).optional(),
    action: vine.string().optional(),
    plan: vine.string().exists(exists('plans', 'slug')).optional(),
  })
)

export const signUpValidator = vine.compile(
  vine.object({
    username: usernameRule,
    email: vine
      .string()
      .trim()
      .email()
      .unique(unique('users', 'email', { caseInsensitive: true })),
    password: vine.string().minLength(8),
    forward: vine.string().url({ require_tld: app.inProduction, host_whitelist: [host] }).optional(),
    plan: vine.string().exists(exists('plans', 'slug')).optional(),
  })
)

export const passwordResetValidator = vine.compile(
  vine.object({
    token: vine.string(),
    email: vine.string().trim().exists(exists('users', 'email')),
    password: vine.string().minLength(8),
  })
)
