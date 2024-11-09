import AuthAttempt from '#models/auth_attempt'
import RateLimit from '#models/rate_limit'
import SessionLog from '#models/session_log'
import { BaseCommand } from '@adonisjs/core/ace'
import type { CommandOptions } from '@adonisjs/core/types/ace'
import db from '@adonisjs/lucid/services/db'
import { DateTime } from 'luxon'

export default class CleanExpired extends BaseCommand {
  static commandName = 'clean:expired'
  static description = 'Remove expired session log, rate limits, and token records'

  static options: CommandOptions = {
    startApp: true
  }

  async run() {
    this.logger.info('Starting "CleanExpired"')

    // delete logged out sessions that haven't been touched in a year
    const [numDeletedSessionLogs] = await SessionLog.query()
      .whereNotNull('logoutAt')
      .where('forceLogout', false)
      .where((query) => query
        .whereNull('lastTouchedAt')
        .orWhere('lastTouchedAt', '<', DateTime.now().minus({ year: 1 }).toSQL())
      )
      .delete('*')

    this.logger.action(`Deleted ${numDeletedSessionLogs} records from ${SessionLog.table}`).succeeded()

    // delete rate limits that expired more than 1 month ago
    const [numDeletedRateLimits] = await RateLimit.query()
      .where('expire', '<', DateTime.now().minus({ month: 1 }).toMillis())
      .delete('*')

    this.logger.action(`Deleted ${numDeletedRateLimits} records from ${RateLimit.table}`).succeeded()

    // delete auth attempts that were expired more than 1 year ago
    const [numDeletedAuthAttempts] = await AuthAttempt.query()
      .where('deletedAt', '<', DateTime.now().minus({ year: 1 }).toSQL())
      .delete('*')

    this.logger.action(`Deleted ${numDeletedAuthAttempts} records from ${AuthAttempt.table}`).succeeded()

    // delete remember me tokens that expired more than 1 month ago
    const [numDeletedRememberMeTokens] = await db.from('remember_me_tokens')
      .where('expires_at', '<', DateTime.now().minus({ month: 1 }).toSQL())
      .delete('*')

    this.logger.action(`Deleted ${numDeletedRememberMeTokens || 0} records from remember_me_tokens`).succeeded()

    this.logger.info('Ending "CleanExpired"')
  }
}
