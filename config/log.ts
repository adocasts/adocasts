import Env from '@ioc:Adonis/Core/Env'
import { DiscordContract } from '@ioc:Logger/Discord'

const webhook = Env.get('DISCORD_WEBHOOK')

export const discordLogConfig: DiscordContract = {
  enabled: webhook && webhook !== '<discord_webhook>' ? true : false,
  hook: webhook ? webhook : '',
  serviceName: Env.get('NODE_ENV')
}