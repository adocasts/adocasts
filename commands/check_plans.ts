import Plans from '#enums/plans'
import StripeSubscriptionStatuses from '#enums/stripe_subscription_statuses'
import User from '#models/user'
import logger from '#services/logger_service'
import { BaseCommand } from '@adonisjs/core/ace'
import type { CommandOptions } from '@adonisjs/core/types/ace'
import { DateTime } from 'luxon'

export default class CheckPlans extends BaseCommand {
  static commandName = 'check:plans'
  static description = 'Check user subscription plans and statuses for discrepencies'

  static options: CommandOptions = {
    startApp: true,
  }

  async run() {
    this.logger.info('Starting "CheckPlans"')

    await this.#cancelExpired()
  }

  /**
   * Clean up expired subscriptions by switching them to canceled
   */
  async #cancelExpired() {
    const users = await User.query()
      .where('stripeSubscriptionStatus', StripeSubscriptionStatuses.INCOMPLETE_EXPIRED)
      .whereNotNull('planPeriodEnd')
      .where('planPeriodEnd', '<', DateTime.now().toSQL())

    const ids = users.map((user) => user.id)

    await logger.info(
      `Switching the following ${ids.length} userIds from INCOMPLETE_EXPIRED to CANCELED: ${ids.join(', ')}`
    )

    const promises = users.map((user) => {
      user.merge({
        planId: Plans.FREE,
        planPeriodStart: null,
        planPeriodEnd: null,
        stripeSubscriptionStatus: StripeSubscriptionStatuses.CANCELED,
      })

      return user.save()
    })

    await Promise.all(promises)

    this.logger.info(`Updated ${ids.length} users from INCOMPLETE_EXPIRED to CANCELED`)
  }
}
