import Database from "@ioc:Adonis/Lucid/Database";
import DiscordLogger from "@ioc:Logger/Discord";
import States from "App/Enums/States";
import User from "App/Models/User";
import StripeService from "./StripeService";
import Logger from '@ioc:Adonis/Core/Logger';

export default class UserService {
  /**
   * delete user's account and associated data
   * @param user 
   */
  public static async destroy(user: User) {
    const trx = await Database.transaction()

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
        await DiscordLogger.error(`UserService.destroy.cancelCustomerSubscriptions > An error occurred for user id: ${user.id}, stripe customer id ${user.stripeCustomerId}`)
      }

      return true
    } catch (error) {
      Logger.error(error.message)
      DiscordLogger.error(`Failed to delete user id: ${user.id}`, error.message)
      await trx.rollback()
      return false
    }
  }

  /**
   * delete or disassociate user's comments
   * @param user 
   */
  public static async destroyComments(user: User) {
    const comments = await user.related('comments').query().withCount('responses', q => q.where('stateId', States.PUBLIC))

    for (let i = 0; i < comments.length; i++) {
      const comment = comments[i]

      if (comment.$extras.responses_count === '0') {
        await comment.delete()
        continue;
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
  public static async destroyLessonRequests(user: User) {
    const requests = await user.related('lessonRequests').query()
    
    await user.related('lessonRequestVotes').query().delete()

    for (let i = 0; i < requests.length; i++) {
      const request = requests[i]

      await request.related('comments').query().delete()
      await request.related('votes').query().delete()
      await request.delete()
    }
  }
}