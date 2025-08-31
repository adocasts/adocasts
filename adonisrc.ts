import { defineConfig } from '@adonisjs/core/app'

export default defineConfig({
  /*
  |--------------------------------------------------------------------------
  | Commands
  |--------------------------------------------------------------------------
  |
  | List of ace commands to register from packages. The application commands
  | will be scanned automatically from the "./commands" directory.
  |
  */
  commands: [
    () => import('@adonisjs/core/commands'),
    () => import('@adonisjs/lucid/commands'),
    () => import('@adonisjs/bouncer/commands'),
    () => import('@adonisjs/mail/commands'),
    () => import('@adonisjs/cache/commands'),
    () => import('@adocasts.com/actions/commands'),
    () => import('@adocasts.com/dto/commands'),
  ],

  /*
  |--------------------------------------------------------------------------
  | Service providers
  |--------------------------------------------------------------------------
  |
  | List of service providers to import and register when booting the
  | application
  |
  */
  providers: [
    () => import('@adonisjs/core/providers/app_provider'),
    () => import('@adonisjs/core/providers/hash_provider'),
    {
      file: () => import('@adonisjs/core/providers/repl_provider'),
      environment: ['repl', 'test'],
    },
    () => import('@adonisjs/core/providers/vinejs_provider'),
    () => import('@adonisjs/core/providers/edge_provider'),
    () => import('@adonisjs/session/session_provider'),
    () => import('@adonisjs/vite/vite_provider'),
    () => import('@adonisjs/shield/shield_provider'),
    () => import('@adonisjs/static/static_provider'),
    () => import('@adonisjs/lucid/database_provider'),
    () => import('@adonisjs/auth/auth_provider'),
    () => import('@adonisjs/ally/ally_provider'),
    () => import('@adonisjs/bouncer/bouncer_provider'),
    () => import('@adonisjs/limiter/limiter_provider'),
    () => import('@adonisjs/mail/mail_provider'),
    () => import('@adonisjs/redis/redis_provider'),
    () => import('@adonisjs/cache/cache_provider'),
    () => import('@adonisjs/drive/drive_provider'),
  ],

  /*
  |--------------------------------------------------------------------------
  | Preloads
  |--------------------------------------------------------------------------
  |
  | List of modules to import before starting the application.
  |
  */
  preloads: [
    () => import('#start/routes'),
    () => import('#start/kernel'),
    () => import('#start/globals'),
    () => import('#start/validator/index'),
    () => import('#start/events'),
    () => import('#start/lucid/base_model'),
    () => import('#start/lucid/query_builder'),
    () => import('#start/context/index'),
    () => import('#start/session/toast'),
    () => import('#start/hyperdx'),
  ],

  /*
  |--------------------------------------------------------------------------
  | Tests
  |--------------------------------------------------------------------------
  |
  | List of test suites to organize tests by their type. Feel free to remove
  | and add additional suites.
  |
  */
  tests: {
    suites: [
      {
        files: ['tests/unit/**/*.spec(.ts|.js)'],
        name: 'unit',
        timeout: 2000,
      },
      {
        files: ['tests/functional/**/*.spec(.ts|.js)'],
        name: 'functional',
        timeout: 30000,
      },
    ],
    forceExit: false,
  },

  metaFiles: [
    {
      pattern: 'resources/views/**/*.edge',
      reloadServer: false,
    },
    {
      pattern: 'public/**',
      reloadServer: false,
    },
  ],

  assetsBundler: false,
  hooks: {
    onBuildStarting: [() => import('@adonisjs/vite/build_hook')],
  },
})
