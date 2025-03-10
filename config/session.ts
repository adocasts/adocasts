import env from '#start/env'
import app from '@adonisjs/core/services/app'
import { defineConfig, stores } from '@adonisjs/session'
import { SessionConfig } from '@adonisjs/session/types'

export const sessionCookieName = 'adonis-session'
export const sessionCookie: SessionConfig['cookie'] = {
  path: '/',
  httpOnly: true,
  secure: app.inProduction,
  sameSite: 'lax',
  domain: '',
}

const sessionConfig = defineConfig({
  enabled: true,
  cookieName: sessionCookieName,

  /**
   * When set to true, the session id cookie will be deleted
   * once the user closes the browser.
   */
  clearWithBrowser: false,

  /**
   * Define how long to keep the session data alive without
   * any activity.
   */
  age: '2h',

  /**
   * Configuration for session cookie and the
   * cookie store
   */
  cookie: sessionCookie,

  /**
   * The store to use. Make sure to validate the environment
   * variable in order to infer the store name without any
   * errors.
   */
  store: env.get('SESSION_DRIVER'),

  /**
   * List of configured stores. Refer documentation to see
   * list of available stores and their config.
   */
  stores: {
    cookie: stores.cookie(),
  },
})

export default sessionConfig
