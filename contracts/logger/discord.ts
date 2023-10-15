declare module '@ioc:Logger/Discord' {
  import Logger from 'providers/LogProvider/discord'
  import { DiscordLoggerOptions } from 'node-discord-logger'


  interface DiscordContract extends DiscordLoggerOptions {
    enabled: boolean
  }

  const DiscordLogger: Logger
}