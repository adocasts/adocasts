import app from '@adonisjs/core/services/app'
import env from '#start/env'
import DiscordLogger from './discord_service.js'

type LogPayload = {
  message: string
  description: string
}

class LoggerService {
  declare logger: DiscordLogger
  declare enabled: boolean

  constructor() {
    const webhook = env.get('DISCORD_WEBHOOK')
    const enabled = webhook && webhook !== '<discord_webhook>' ? true : false
    const serviceName = env.get('NODE_ENV')

    if (!enabled) return

    this.enabled = enabled
    this.logger = new DiscordLogger({ hook: webhook!, serviceName })
  }

  async info(title: string, message?: string | object | Array<any>): Promise<void> {
    return this.log('info', this.build(title, message))
  }

  async warn(title: string, message?: string | object | Array<any>): Promise<void> {
    return this.log('warn', this.build(title, message))
  }

  async error(title: string, message?: string | object | Array<any>): Promise<void> {
    return this.log('error', this.build(title, message))
  }

  async debug(title: string, message?: string | object | Array<any>): Promise<void> {
    return this.log('debug', this.build(title, message))
  }

  async silly(title: string, message?: string | object | Array<any>): Promise<void> {
    return this.log('silly', this.build(title, message))
  }

  async log(method: 'info' | 'warn' | 'error' | 'debug' | 'silly', payload: LogPayload) {
    console.log({ method, payload })
    if (app.inTest || !this.enabled) return
    return this.logger[method](payload)
  }

  private build(title: string, message?: string | object | Array<any>) {
    return {
      message: title,
      description: JSON.stringify(message, null, 4),
    }
  }
}

const logger = new LoggerService()
export default logger
