declare module '@ioc:Logger/Discord' {
  import Logger from 'providers/LogProvider/discord'

  const DiscordLogger: Logger

  export default DiscordLogger
}