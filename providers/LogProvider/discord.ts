import DiscordLogger from 'node-discord-logger'
import { discordLogConfig } from 'Config/log'
import { ApplicationContract } from '@ioc:Adonis/Core/Application'

type LogPayload = {
  message: string,
  description: string
}

export default class Logger {
  protected logger: DiscordLogger

  constructor(protected config: typeof discordLogConfig, protected app: ApplicationContract) {
    if (!config.enabled) return

    this.logger = new DiscordLogger(config)
  }

  public async info(title: string, message?: string | object | Array<any>): Promise<void> {
    return this.log('info', this.build(title, message))
  }

  public async warn(title: string, message?: string | object | Array<any>): Promise<void> {
    return this.log('warn', this.build(title, message))
  }

  public async error(title: string, message?: string | object | Array<any>): Promise<void> {
    return this.log('error', this.build(title, message))
  }

  public async debug(title: string, message?: string | object | Array<any>): Promise<void> {
    return this.log('debug', this.build(title, message))
  }

  public async silly(title: string, message?: string | object | Array<any>): Promise<void> {
    return this.log('silly', this.build(title, message))
  }

  public async log(method: 'info'|'warn'|'error'|'debug'|'silly', payload: LogPayload) {
    if (this.app.inTest || !this.config.enabled) return 
    return this.logger[method](payload)
  }

  private build(title: string, message?: string | object | Array<any>) {
    return {
      message: title,
      description: JSON.stringify(message, null, 4)
    }
  }
}