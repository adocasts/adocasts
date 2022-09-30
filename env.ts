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
	APP_DOMAIN: Env.schema.string(),
	APP_KEY: Env.schema.string(),
	APP_NAME: Env.schema.string(),
	APP_BRAND: Env.schema.string(),
	APP_LOGO: Env.schema.string(),
	APP_LOGO_INV: Env.schema.string(),
	APP_CONTACT_EMAIL: Env.schema.string({ format: 'email' }),
	CACHE_VIEWS: Env.schema.boolean(),
	SESSION_DRIVER: Env.schema.string(),
  DRIVE_DISK: Env.schema.enum(['local', 'gcs'] as const),
	NODE_ENV: Env.schema.enum(['development', 'production', 'test'] as const),

	PG_HOST: Env.schema.string({ format: 'host' }),
	PG_PORT: Env.schema.number(),
	PG_USER: Env.schema.string(),
	PG_PASSWORD: Env.schema.string.optional(),
	PG_DB_NAME: Env.schema.string(),

	GOOGLE_CLIENT_ID: Env.schema.string(),
	GOOGLE_CLIENT_SECRET: Env.schema.string(),

	GITHUB_CLIENT_ID: Env.schema.string(),
	GITHUB_CLIENT_SECRET: Env.schema.string(),

	SMTP_HOST: Env.schema.string({ format: 'host' }),
	SMTP_PORT: Env.schema.number(),
	SMTP_USERNAME: Env.schema.string(),
	SMTP_PASSWORD: Env.schema.string(),

	REDIS_CONNECTION: Env.schema.enum(['local'] as const),
	REDIS_HOST: Env.schema.string({ format: 'host' }),
	REDIS_PORT: Env.schema.number(),
	REDIS_PASSWORD: Env.schema.string.optional(),

	ALLOWED_ORIGINS: Env.schema.string()
})
