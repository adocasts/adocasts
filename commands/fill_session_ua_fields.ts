import SessionLog from '#models/session_log'
import { BaseCommand } from '@adonisjs/core/ace'
import { UAParser } from 'ua-parser-js'
import type { CommandOptions } from '@adonisjs/core/types/ace'
import logger from '#services/logger_service'

export default class FillSessionUaFields extends BaseCommand {
  static commandName = 'fill:session-ua-fields'
  static description = 'Fills session user agent fields from user agent string'

  static options: CommandOptions = {
    startApp: true,
  }

  async run() {
    this.logger.info('Starting "FillSessionUaFields"')

    try {
      const updated = []
      const sessions = await SessionLog.query()
        .whereNull('browserName')
        .whereNotNull('userAgent')

      for (const session of sessions) {
        if (!session.userAgent) continue

        const ua = UAParser(session.userAgent)

        session.browserName = ua?.browser?.name || null
        session.browserEngine = ua?.engine?.name || null
        session.browserVersion = ua?.browser?.version || null
        session.deviceModel = ua?.device?.model || null
        session.deviceType = ua?.device?.type || null
        session.deviceVendor = ua?.device?.vendor || null
        session.osName = ua?.os?.name || null
        session.osVersion = ua?.os?.version || null

        await session.save()

        updated.push(session)
      }

      this.logger.info(`Updated ${updated.length} sessions.`)
    } catch (error) {
      await logger.error('FillSessionUaFields:run', error)
      
      this.logger.error(error.message)
      this.error = error
      this.exitCode = 1
    }

    this.logger.info(`Finished "FillSessionUaFields" ${this.exitCode !== 1 ? 'successfully' : 'with errors'}`)
  }
}
