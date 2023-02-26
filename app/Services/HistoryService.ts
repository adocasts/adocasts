import { AuthContract } from "@ioc:Adonis/Addons/Auth";
import User from "App/Models/User";
import History from 'App/Models/History'
import HistoryValidator from "App/Validators/HistoryValidator";
import HistoryTypes from "App/Enums/HistoryTypes";
import Post from "App/Models/Post";

export default class HistoryService {
  protected static completedPercentThreshold = 90

  /**
   * returns user's progression history for provided post
   * @param auth 
   * @param post 
   * @returns 
   */
  public static async getPostProgression(auth: AuthContract, post: Post) {
    return post.related('progressionHistory').query().where('userId', auth.user!.id).orderBy('updatedAt', 'desc').first()
  }

  /**
   * toggles whether the auth user has completed the history item
   * @param auth 
   * @param routeName 
   * @param data 
   * @returns 
   */
  public static async toggleComplete(auth: AuthContract, routeName: string | undefined, data: HistoryValidator['schema']['props']) {
    const progression = await this.getProgressionOrNew(auth.user!, routeName, data)

    progression.isCompleted = !progression.isCompleted

    // if watch percent is above completed threshold, set to just under threshold
    if (progression.watchPercent && progression.watchPercent >= this.completedPercentThreshold) {
      progression.watchPercent = this.completedPercentThreshold - 1
    }

    // if watch percent is above completed threshold, set to just under threshold
    if (progression.readPercent && progression.readPercent >= this.completedPercentThreshold) {
      progression.readPercent = this.completedPercentThreshold - 1
    }

    await progression.save()

    return progression
  }

  /**
   * returns first or new history item
   * @param user 
   * @param routeName 
   * @param data 
   * @returns 
   */
  private static async getProgressionOrNew(user: User, routeName: string | undefined, data: HistoryValidator['schema']['props']) {
    const query: Partial<History> = {
      userId: user.id,
      historyTypeId: HistoryTypes.PROGRESSION
    }

    if (data.postId)        query.postId = data.postId
    if (data.collectionId)  query.collectionId = data.collectionId
    if (data.taxonomyId)    query.taxonomyId = data.taxonomyId

    return History.firstOrNew(query, {
      userId: user.id,
      route: routeName,
      historyTypeId: HistoryTypes.PROGRESSION
    })
  }
}