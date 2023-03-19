import { AuthContract } from "@ioc:Adonis/Addons/Auth";
import User from "App/Models/User";
import History from 'App/Models/History'
import HistoryValidator from "App/Validators/HistoryValidator";
import HistoryTypes from "App/Enums/HistoryTypes";
import Post from "App/Models/Post";
import Collection from "App/Models/Collection";
import Taxonomy from "App/Models/Taxonomy";
import NotImplementedException from "App/Exceptions/NotImplementedException";

export default class HistoryService {
  protected static completedPercentThreshold = 90

  /**
   * returns user's progression history for provided post
   * @param auth 
   * @param post 
   * @returns 
   */
  public static async getPostProgression(auth: AuthContract, post: Post) {
    if (!auth.user) return
    return post.related('progressionHistory').query().where('userId', auth.user!.id).orderBy('updatedAt', 'desc').first()
  }

  /**
   * records a view to the user's history for the provided record
   * @param user 
   * @param record 
   * @param routeName 
   * @returns 
   */
  public static async recordView(user: User | undefined, record: Post | Collection | Taxonomy, routeName: string | undefined = undefined) {
    if (!user) return

    const idColumn = this.getRecordRelationColumn(record)

    return History.create({
      userId: user.id,
      route: routeName,
      historyTypeId: HistoryTypes.VIEW,
      [idColumn]: record.id
    })
  }

  /**
   * returns the History column name for the provided relation record
   * @param record 
   * @returns 
   */
  public static getRecordRelationColumn(record: Post | Collection | Taxonomy) {
    switch (true) {
      case record instanceof Post:
        return 'postId'
      case record instanceof Collection:
        return 'collectionId'
      case record instanceof Taxonomy:
        return 'taxonomyId'
      default:
        throw new NotImplementedException(`HistoryService.recordView has not yet implemented support for record of type: ${record.constructor.name}`)
    }
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