import Env from '@ioc:Adonis/Core/Env'

export const discordLogConfig = {
  hook: Env.get('DISCORD_WEBHOOK'),
  serviceName: Env.get('NODE_ENV')
}