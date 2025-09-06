import env from '#start/env'
import { defineConfig, targets } from '@adonisjs/core/logger'
import app from '@adonisjs/core/services/app'
import * as HyperDX from '@hyperdx/node-opentelemetry'

const loggerConfig = defineConfig({
  default: 'app',

  /**
   * The loggers object can be used to define multiple loggers.
   * By default, we configure only one logger (named "app").
   */
  loggers: {
    app: {
      enabled: true,
      name: env.get('APP_NAME'),
      level: env.get('LOG_LEVEL'),
      transport: {
        mixin: HyperDX.getPinoMixinFunction,
        targets: targets()
          .pushIf(!app.inProduction, targets.pretty())
          .pushIf(app.inProduction, targets.file({ destination: 1 }))
          .pushIf(
            app.inProduction && !!env.get('HYPERDX_INTEGESTION_KEY'),
            HyperDX.getPinoTransport('error', {
              // Send logs info and above
              detectResources: true,
            })
          )
          .toArray(),
      },
    },
  },
})

export default loggerConfig

/**
 * Inferring types for the list of loggers you have configured
 * in your application.
 */
declare module '@adonisjs/core/types' {
  export interface LoggersList extends InferLoggers<typeof loggerConfig> {}
}
