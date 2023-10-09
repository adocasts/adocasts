import Env from '@ioc:Adonis/Core/Env'

const webhook = Env.get('DISCORD_WEBHOOK')

export const discordLogConfig = {
  enabled: webhook && webhook !== '<discord_webhook>' ? true : false,
  hook: webhook,
  serviceName: Env.get('NODE_ENV')
}