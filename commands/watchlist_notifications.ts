import States from '#enums/states'
import Post from '#models/post'
import User from '#models/user'
import logger from '#services/logger_service'
import env from '#start/env'
import { BaseCommand } from '@adonisjs/core/ace'
import router from '@adonisjs/core/services/router'
import type { CommandOptions } from '@adonisjs/core/types/ace'
import mail from '@adonisjs/mail/services/main'
import { DateTime } from 'luxon'
import { setTimeout } from 'node:timers/promises'

export default class WatchlistNotifications extends BaseCommand {
  static commandName = 'watchlist:notifications'
  static description = 'Check for and send new watchlist notifications'
  static options: CommandOptions = {
    startApp: true,
  }

  async run() {
    this.logger.info('Starting "WatchlistNotifications"')

    // command will run hourly, but let's go back through yesterday's posts
    // to capture any failures that may have happened on prior runs
    // determined by isWatchlistSent, which is set to true
    // prior to any emails actually sending
    const end = DateTime.now()
    const start = DateTime.now().minus({ day: 1 }).startOf('day')
    const domain = env.get('APP_DOMAIN')
    const sendables: Record<number, number[]> = {}

    let successes: Record<number, string> = {}
    let failures: Record<number, string> = {}

    // find new posts with potential watchlist relations
    const newPosts = await Post.query()
      .where('stateId', States.PUBLIC)
      .where('isWatchlistSent', false)
      .whereBetween('publishAt', [start.toSQL(), end.toSQL()])
      .preload('watchlist')
      .preload('rootSeries', (query) => query.preload('watchlist'))
      .orderBy([
        { column: 'publishAt', order: 'desc' },
        { column: 'id', order: 'desc' },
      ])

    newPosts.map((post) => {
      const postUserIds = post.watchlist.map((item) => item.userId)
      const collectionUserIds = [
        ...new Set(
          post.rootSeries.reduce(
            (arr: number[], series) => [...arr, ...series.watchlist.map((item) => item.userId)],
            []
          )
        ),
      ]

      // limit to tomgobich user during testing phase
      const userIds = [...new Set([...postUserIds, ...collectionUserIds])] //.filter((id) => id === 1)

      // build map of userId to array of postIds user is watching
      userIds.map((id) => {
        if (Array.isArray(sendables[id])) {
          return sendables[id].push(post.id)
        }

        sendables[id] = [post.id]
      })
    })

    this.logger.info(`Found ${newPosts.length} new posts. Marking as sent...`)

    if (newPosts.length) {
      await logger.info(`Found ${newPosts.length} new posts. Marking as sent...`)
    }

    await Promise.all(newPosts.map(async (post) => post.merge({ isWatchlistSent: true }).save()))

    this.logger.info(`Marked ${newPosts.length} posts as sent`)

    // we'll need only the users with watchlist notifications on
    const userIds = Object.keys(sendables).map((id) => Number.parseInt(id))
    const users = await User.query()
      .whereIn('id', userIds)
      .whereHas('profile', (query) => query.where('emailOnWatchlist', true))

    this.logger.info(`Sending notifications to ${users.length} users`)

    if (newPosts.length) {
      await logger.info(`Sending notifications to ${users.length} users`)
    }

    // send a notification email for each user linking to new post(s)
    for (const user of users) {
      const posts = newPosts.filter((post) => sendables[user.id].includes(post.id))
      const turnOffFieldHref = router
        .builder()
        .prefixUrl(domain)
        .disableRouteLookup()
        .params({
          userId: user.id,
          field: 'emailOnWatchlist',
        })
        .makeSigned('/users/:userId/notifications/:field/off')

      const turnOffHref = router
        .builder()
        .prefixUrl(domain)
        .disableRouteLookup()
        .params({ userId: user.id })
        .makeSigned('/users/:userId/notifications/off')

      const title = 'New content has landed in your watchlist'

      try {
        this.logger.info(`Sending email to ${user.id}`)

        await mail.send((mailer) => {
          mailer
            .to(user.email)
            .subject(title)
            .htmlView('emails/watchlist', { title, user, posts, turnOffFieldHref, turnOffHref })
        })

        this.logger.info(`Email sent to ${user.id}`)
        successes[user.id] = 'success'
      } catch (error) {
        this.logger.error(error)
        this.logger.info(`Email failed to send to ${user.id}`)
        failures[user.id] = error.message
      }

      this.logger.info(`Waiting 2.1 seconds...`)
      await setTimeout(2100)
    }

    if (Object.keys(successes).length) {
      this.logger.info(`Sent notifications to ${Object.keys(successes).length} users`)
      await logger.info(`Sent notifications to ${Object.keys(successes).length} users`)
    }

    if (Object.keys(failures).length) {
      this.logger.warning(`Failed to send notifications to ${Object.keys(failures).length} users`)
      await logger.error(
        `Failed to send notifications to ${Object.keys(failures).length} users`,
        failures
      )
    }

    this.logger.info('Finished "WatchlistNotifications"')
  }
}
