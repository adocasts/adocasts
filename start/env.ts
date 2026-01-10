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
  NODE_ENV: Env.schema.enum(['development', 'production', 'test'] as const),
  PORT: Env.schema.number(),
  APP_KEY: Env.schema.secret(),
  APP_URL: Env.schema.string({ format: 'url', tld: false }),
  APP_BRAND: Env.schema.string(),
  APP_CONTACT_EMAIL: Env.schema.string(),
  APP_DOMAIN: Env.schema.string(),
  APP_HOSTNAME: Env.schema.string(),
  CMS_SESSION_DOMAIN: Env.schema.string(),
  HOST: Env.schema.string({ format: 'host' }),
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
  DB_HOST: Env.schema.string({ format: 'host' }),
  DB_PORT: Env.schema.number(),
  DB_USER: Env.schema.string(),
  DB_PASSWORD: Env.schema.string.optional(),
  DB_DATABASE: Env.schema.string(),

  /*
  |----------------------------------------------------------
  | Variables for configuring ally package
  |----------------------------------------------------------
  */
  GITHUB_CLIENT_ID: Env.schema.string(),
  GITHUB_CLIENT_SECRET: Env.schema.string(),
  GITHUB_PAT: Env.schema.string(),
  GOOGLE_CLIENT_ID: Env.schema.string(),
  GOOGLE_CLIENT_SECRET: Env.schema.string(),

  /*
  |----------------------------------------------------------
  | Variables for configuring the limiter package
  |----------------------------------------------------------
  */
  LIMITER_STORE: Env.schema.enum(['database', 'memory'] as const),

  /*
  |----------------------------------------------------------
  | Variables for configuring the mail package
  |----------------------------------------------------------
  */
  SMTP_HOST: Env.schema.string(),
  SMTP_PORT: Env.schema.number(),
  SMTP_USERNAME: Env.schema.string(),
  SMTP_PASSWORD: Env.schema.string(),

  /*
  |----------------------------------------------------------
  | Variables for configuring the redis package
  |----------------------------------------------------------
  */
  REDIS_HOST: Env.schema.string({ format: 'host' }),
  REDIS_PORT: Env.schema.number(),
  REDIS_PASSWORD: Env.schema.string.optional(),

  /*
  |----------------------------------------------------------
  | Variables for configuring the drive package
  |----------------------------------------------------------
  */
  DRIVE_DISK: Env.schema.enum(['r2', 'gcs', 'fs'] as const),
  GCS_KEY: Env.schema.string(),
  GCS_BUCKET: Env.schema.string(),

  /*
  |----------------------------------------------------------
  | Variables for cloudflare turnstile
  |----------------------------------------------------------
  */
  TURNSTILE_ENABLED: Env.schema.boolean(),
  TURNSTILE_SITE_KEY: Env.schema.string(),
  TURNSTILE_SECRET_KEY: Env.schema.string(),

  /*
  |----------------------------------------------------------
  | Variables for stripe integration
  |----------------------------------------------------------
  */
  STRIPE_ENABLED: Env.schema.boolean(),
  STRIPE_PUBLISHABLE_KEY: Env.schema.string(),
  STRIPE_SECRET_KEY: Env.schema.string(),
  STRIPE_WEBHOOK_SECRET: Env.schema.string(),

  /*
  |----------------------------------------------------------
  | Variables for analytics/logging
  |----------------------------------------------------------
  */
  PLAUSIBLE_API_KEY: Env.schema.string.optional(),
  DISCORD_WEBHOOK: Env.schema.string.optional(),
  HYPERDX_INTEGESTION_KEY: Env.schema.string.optional(),

  /*
  |----------------------------------------------------------
  | Variables for external APIs
  |----------------------------------------------------------
  */
  PLOTMYCOURSE_API_URL: Env.schema.string(),
  PLOTMYCOURSE_API_KEY: Env.schema.string.optional(),

  /*
  |----------------------------------------------------------
  | Variables for image/video hosting
  |----------------------------------------------------------
  */
  R2_SIGNING_KEY: Env.schema.string(),
  VIDEO_DOMAIN: Env.schema.string(),
  ASSET_DOMAIN: Env.schema.string.optional(),
  R2_KEY: Env.schema.string(),
  R2_SECRET: Env.schema.string(),
  R2_BUCKET: Env.schema.string(),
  R2_ENDPOINT: Env.schema.string(),

  /*
  |----------------------------------------------------------
  | Variables for configuring the mail package
  |----------------------------------------------------------
  */
  MAIL_MAILER: Env.schema.enum(['smtp'] as const),
  MAIL_FROM_NAME: Env.schema.string(),
  MAIL_FROM_ADDRESS: Env.schema.string()
})
