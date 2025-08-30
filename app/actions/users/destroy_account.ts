import BaseAction from '#actions/base_action'
import States from '#enums/states'
import DiscussionView from '#models/discussion_view'
import User from '#models/user'
import logger from '#services/logger_service'
import stripe from '#services/stripe_service'
import { confirmUsernameValidator } from '#validators/user_setting'
import { HttpContext } from '@adonisjs/core/http'
import db from '@adonisjs/lucid/services/db'

export default class DestroyAccount extends BaseAction {
  validator = confirmUsernameValidator

  async asController({ response, auth, session }: HttpContext) {
    const success = await this.handle(auth.user!)

    if (!success) {
      session.toast(
        'error',
        'Apologies, but something went wrong. Please email tom@adocasts.com if this persists.'
      )
      return response.redirect().back()
    }

    await auth.use('web').logout()

    session.toast('success', 'Your account has been successfully deleted.')

    return response.redirect().toPath('/')
  }

  async handle(user: User) {
    const trx = await db.transaction()

    user.useTransaction(trx)

    try {
      // purge data
      await user.related('histories').query().delete()
      await user.related('progresses').query().delete()
      await user.related('watchlist').query().delete()
      await user.related('notifications').query().delete()
      await user.related('initiatedNotifications').query().delete()
      await user.related('emailHistory').query().delete()
      await user.related('commentVotes').query().update({ userId: null })
      await user.related('invoices').query().delete()
      await user.related('sessions').query().delete()

      await DiscussionView.query({ client: trx }).where('userId', user.id).update({ userId: null })

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
          await stripe.cancelCustomerSubscriptions(user)
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

  async destroyComments(user: User) {
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

  async destroyLessonRequests(user: User) {
    const requests = await user.related('lessonRequests').query()

    await user.related('lessonRequestVotes').query().delete()

    for (const request of requests) {
      await request.related('comments').query().delete()
      await request.related('votes').query().delete()
      await request.delete()
    }
  }

  async destroyDiscussions(user: User) {
    const discussions = await user.related('discussions').query()

    await user.related('discussionVotes').query().update({ userId: null })

    for (const discussion of discussions) {
      await discussion.related('comments').query().delete()
      await discussion.related('votes').query().delete()
      await discussion.delete()
    }
  }
}
