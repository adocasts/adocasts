/*
|--------------------------------------------------------------------------
| Environment variables service
|--------------------------------------------------------------------------
|
| The `Env.create` method creates an instance of the Env service. The
| service validates the environment variables and also cast values
| to JavaScript data types.
|
*/

import { Env } from '@adonisjs/core/env'

export default await Env.create(new URL('../', import.meta.url), {
  HOST: Env.schema.string({ format: 'host' }),
  PORT: Env.schema.number(),
  APP_KEY: Env.schema.string(),
  APP_BRAND: Env.schema.string(),
  APP_LOGO: Env.schema.string(),
  APP_LOGO_INV: Env.schema.string(),
  APP_CONTACT_EMAIL: Env.schema.string(),
  APP_DOMAIN: Env.schema.string(),
  CACHE_VIEWS: Env.schema.boolean(),
  DRIVE_DISK: Env.schema.enum(['local', 'gcs'] as const),
  NODE_ENV: Env.schema.enum(['development', 'production', 'test'] as const),
  ASSET_DOMAIN: Env.schema.string.optional({ format: 'url' }),
  LOG_LEVEL: Env.schema.string(),
  IDENTITY_SECRET: Env.schema.string(),

  /*
  |----------------------------------------------------------
  | Variables for configuring session package
  |----------------------------------------------------------
  */
  SESSION_DRIVER: Env.schema.enum(['cookie', 'memory'] as const),

  /*
  |----------------------------------------------------------
  | Variables for configuring database connection
  |----------------------------------------------------------
  */
  DB_CONNECTION: Env.schema.string(),
  DB_HOST: Env.schema.string({ format: 'host' }),
  DB_PORT: Env.schema.number(),
  DB_USER: Env.schema.string(),
  DB_PASSWORD: Env.schema.string.optional(),
  DB_DATABASE: Env.schema.string(),

  // @adonisjs/mail
  SMTP_HOST: Env.schema.string({ format: 'host' }),
  SMTP_PORT: Env.schema.number(),
  SMTP_USERNAME: Env.schema.string(),
  SMTP_PASSWORD: Env.schema.string(),

  // @adonisjs/redis
  REDIS_ENABLED: Env.schema.boolean(),
  REDIS_HOST: Env.schema.string({ format: 'host' }),
  REDIS_PORT: Env.schema.number(),

  // @adonisjs/drive-gcs
  GCS_KEY_FILENAME: Env.schema.string(),
  GCS_BUCKET: Env.schema.string(),

  // @adonisjs/ally
  GOOGLE_CLIENT_ID: Env.schema.string(),
  GOOGLE_CLIENT_SECRET: Env.schema.string(),
  GITHUB_CLIENT_ID: Env.schema.string(),
  GITHUB_CLIENT_SECRET: Env.schema.string(),

  TURNSTILE_ENABLED: Env.schema.boolean(),
  TURNSTILE_SITE_KEY: Env.schema.string(),
  TURNSTILE_SECRET_KEY: Env.schema.string(),

  NOTION_SECRET: Env.schema.string(),
  NOTION_VERSION: Env.schema.string(),
  NOTION_DB_SERIES: Env.schema.string(),
  NOTION_DB_MODULES: Env.schema.string(),
  NOTION_DB_POSTS: Env.schema.string(),

  STRIPE_ENABLED: Env.schema.boolean(),
  STRIPE_PUBLISHABLE_KEY: Env.schema.string(),
  STRIPE_SECRET_KEY: Env.schema.string(),
  STRIPE_WEBHOOK_SECRET: Env.schema.string(),

  PLAUSIBLE_API_KEY: Env.schema.string.optional(),
  DISCORD_WEBHOOK: Env.schema.string.optional(),

  PLOTMYCOURSE_API_URL: Env.schema.string(),
  PLOTMYCOURSE_API_KEY: Env.schema.string.optional(),
})
