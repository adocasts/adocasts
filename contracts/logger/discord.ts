declare module '@ioc:Logger/Discord' {
  import Logger from 'providers/LogProvider/discord'
  import { DiscordLoggerOptions } from 'node-discord-logger'


  export interface DiscordContract extends DiscordLoggerOptions {
    enabled: boolean
  }

  const DiscordLogger: Logger

  export default DiscordLogger
}