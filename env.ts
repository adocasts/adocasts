/*
|--------------------------------------------------------------------------
| Validating Environment Variables
|--------------------------------------------------------------------------
|
| In this file we define the rules for validating environment variables.
| By performing validation we ensure that your application is running in
| a stable environment with correct configuration values.
|
| This file is read automatically by the framework during the boot lifecycle
| and hence do not rename or move this file to a different location.
|
*/

import Env from '@ioc:Adonis/Core/Env'

export default Env.rules({
	HOST: Env.schema.string({ format: 'host' }),
	PORT: Env.schema.number(),
	APP_KEY: Env.schema.string(),
	APP_NAME: Env.schema.string(),
	CACHE_VIEWS: Env.schema.boolean(),
	SESSION_DRIVER: Env.schema.string(),
  DRIVE_DISK: Env.schema.enum(['local', 'gcs'] as const),
	NODE_ENV: Env.schema.enum(['development', 'production', 'test'] as const),

	// @adonisjs/lucid
	DB_CONNECTION: Env.schema.string(),
	PG_HOST: Env.schema.string({ format: 'host' }),
	PG_PORT: Env.schema.number(),
	PG_USER: Env.schema.string(),
	PG_PASSWORD: Env.schema.string.optional(),
	PG_DB_NAME: Env.schema.string(),

	// @adonisjs/mail
	SMTP_HOST: Env.schema.string({ format: 'host' }),
	SMTP_PORT: Env.schema.number(),
	SMTP_USERNAME: Env.schema.string(),
	SMTP_PASSWORD: Env.schema.string(),

	// @adonisjs/drive-gcs
	GCS_KEY_FILENAME: Env.schema.string(),
	GCS_BUCKET: Env.schema.string(),

	// @adonisjs/redis
	REDIS_CONNECTION: Env.schema.enum(['local'] as const),
	REDIS_HOST: Env.schema.string({ format: 'host' }),
	REDIS_PORT: Env.schema.number(),
	REDIS_PASSWORD: Env.schema.string.optional(),

	// @adonisjs/ally
	GOOGLE_CLIENT_ID: Env.schema.string(),
	GOOGLE_CLIENT_SECRET: Env.schema.string(),
	GITHUB_CLIENT_ID: Env.schema.string(),
	GITHUB_CLIENT_SECRET: Env.schema.string(),

	DISCORD_WEBHOOK: Env.schema.string(),

  TURNSTILE_SITE_KEY: Env.schema.string(),
  TURNSTILE_SECRET_KEY: Env.schema.string(),

	NOTION_SECRET: Env.schema.string(),
	NOTION_VERSION: Env.schema.string(),

	STRIPE_PUBLISHABLE_KEY: Env.schema.string(),
	STRIPE_SECRET_KEY: Env.schema.string(),
	STRIPE_WEBHOOK_SECRET: Env.schema.string(),

	DROPBOX_ACCESS_TOKEN: Env.schema.string(),
})
