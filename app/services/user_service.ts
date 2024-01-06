import db from '@adonisjs/lucid/services/db'
import States from '#enums/states'
import User from '#models/user'
import StripeService from './stripe_service.js'
import logger from './logger_service.js'

export default class UserService {
  /**
   * delete user's account and associated data
   * @param user
   */
  static async destroy(user: User) {
    const trx = await db.transaction()

    user.useTransaction(trx)

    try {
      // purge data
      await user.related('histories').query().delete()
      await user.related('watchlist').query().delete()
      await user.related('notifications').query().delete()
      await user.related('initiatedNotifications').query().delete()
      await user.related('emailHistory').query().delete()
      await user.related('commentVotes').query().update({ userId: null })
      await user.related('invoices').query().delete()
      await user.related('sessions').query().delete()
      await this.destroyComments(user)
      await this.destroyLessonRequests(user)
      await this.destroyDiscussions(user)

      // purge profile
      await user.related('profile').query().delete()

      // purge account
      await user.delete()

      await trx.commit()

      try {
        if (user.stripeCustomerId) {
          const stripeService = new StripeService()
          await stripeService.cancelCustomerSubscriptions(user)
        }
      } catch (error) {
        await logger.error(
          `UserService.destroy.cancelCustomerSubscriptions > An error occurred for user id: ${user.id}, stripe customer id ${user.stripeCustomerId}`
        )
      }

      return true
    } catch (error) {
      logger.error(`Failed to delete user id: ${user.id}`, error.message)
      await trx.rollback()
      return false
    }
  }

  /**
   * delete or disassociate user's comments
   * @param user
   */
  static async destroyComments(user: User) {
    const comments = await user
      .related('comments')
      .query()
      .withCount('responses', (q) => q.where('stateId', States.PUBLIC))

    for (const comment of comments) {
      if (comment.$extras.responses_count === '0') {
        await comment.delete()
        continue
      }

      comment.stateId = States.ARCHIVED
      comment.userId = null
      comment.body = '[deleted]'
      await comment.save()
    }
  }

  /**
   * delete user's lesson requests & lesson request votes
   * @param user
   */
  static async destroyLessonRequests(user: User) {
    const requests = await user.related('lessonRequests').query()

    await user.related('lessonRequestVotes').query().delete()

    for (const request of requests) {
      await request.related('comments').query().delete()
      await request.related('votes').query().delete()
      await request.delete()
    }
  }

  static async destroyDiscussions(user: User) {
    const discussions = await user.related('discussions').query()

    await user.related('discussionVotes').query().update({ userId: null })

    for (const discussion of discussions) {
      await discussion.related('comments').query().delete()
      await discussion.related('votes').query().delete()
      await discussion.delete()
    }
  }
}
