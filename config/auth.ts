import { sessionGuard, tokensProvider } from '@adonisjs/auth/session'
import { defineConfig, providers } from '@adonisjs/auth'
import { InferAuthEvents, Authenticators } from '@adonisjs/auth/types'

const rememberTokensProvider = tokensProvider.db({
  table: 'remember_me_tokens',
})

const authConfig = defineConfig({
  default: 'web',
  guards: {
    web: sessionGuard({
      tokens: rememberTokensProvider,
      rememberMeTokenAge: '2 years',
      provider: providers.lucid({
        model: () => import('#models/user'),
        uids: ['email', 'username'],
      }),
    }),
  },
})

export default authConfig

/**
 * Inferring types from the configured auth
 * guards.
 */
declare module '@adonisjs/auth/types' {
  interface Authenticators extends InferAuthenticators<typeof authConfig> {}
}
declare module '@adonisjs/core/types' {
  interface EventsList extends InferAuthEvents<Authenticators> {}
}
