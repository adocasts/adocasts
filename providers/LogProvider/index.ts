import { ApplicationContract } from '@ioc:Adonis/Core/Application'
import * as Sentry from '@sentry/node'

/*
|--------------------------------------------------------------------------
| Provider
|--------------------------------------------------------------------------
|
| Your application is not ready when this file is loaded by the framework.
| Hence, the top level imports relying on the IoC container will not work.
| You must import them inside the life-cycle methods defined inside
| the provider class.
|
| @example:
|
| public async ready () {
|   const Database = this.app.container.resolveBinding('Adonis/Lucid/Database')
|   const Event = this.app.container.resolveBinding('Adonis/Core/Event')
|   Event.on('db:query', Database.prettyPrint)
| }
|
*/
export default class LogProvider {
  constructor(protected app: ApplicationContract) {}

  public register() {
    // Register your own bindings
    this.app.container.singleton('Logger/Discord', () => {
      const { discordLogConfig } = this.app.config.get('log')
      return new (require('./discord').default)(discordLogConfig)
    })
  }

  public async boot() {
    // All bindings are ready, feel free to use them
    Sentry.init({
      dsn: "https://dd03b1044e25432db7c0d237b8a722ec@o1256915.ingest.sentry.io/6426366",
    
      // Set tracesSampleRate to 1.0 to capture 100%
      // of transactions for performance monitoring.
      // We recommend adjusting this value in production
      tracesSampleRate: 0,
    });
  }

  public async ready() {
    // App is ready
  }

  public async shutdown() {
    // Cleanup, since app is going down
  }
}
