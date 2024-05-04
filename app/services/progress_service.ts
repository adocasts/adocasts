import User from '#models/user'
import History from '#models/history'
import { progressValidator } from '#validators/history_validator'
import { Infer } from '@vinejs/vine/types'
import Post from '#models/post'
import { HttpContext } from '@adonisjs/core/http'
import { inject } from '@adonisjs/core'
import Progress from '#models/progress'

@inject()
export default class ProgressService {
  protected completedPercentThreshold = 90

  constructor(protected ctx: HttpContext) {}

  get user() {
    return this.ctx.auth.user
  }

  /**
   * returns user's progression history for provided post
   * @param auth
   * @param post
   * @returns
   */
  async getPostProgression(post: Post) {
    return ProgressService.getPostProgression(this.user, post)
  }

  static async getPostProgression(user: User | undefined, post: Post) {
    if (!user) return
    return post
      .related('progressionHistory')
      .query()
      .where('userId', user!.id)
      .orderBy('updatedAt', 'desc')
      .first()
  }

  /**
   * toggles whether the auth user has completed the history item
   * @param auth
   * @param routeName
   * @param data
   * @returns
   */
  async toggleComplete(data: Partial<Progress>) {
    const progression = await this.getProgressionOrNew(data)

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
   * @param data Partial<Progress>
   * @returns
   */
  private async getProgressionOrNew(data: Partial<Progress>) {
    const query: Partial<History> = {
      userId: this.user!.id,
    }

    if (data.postId) query.postId = data.postId
    if (data.collectionId) query.collectionId = data.collectionId

    return Progress.firstOrNew(query, {
      userId: this.user!.id
    })
  }

  /**
   * creates a new or updates the latest matching history progression record with new history event
   * @param user
   * @param routeName
   * @param data
   * @returns
   */
  async recordProgression(data: Infer<typeof progressValidator>) {
    const progression = await this.getProgressionOrNew(data)

    // if new value is less than previously recorded value, ditch new value
    if (
      typeof data.watchSeconds === 'number' &&
      progression.watchSeconds &&
      data.watchSeconds < progression.watchSeconds
    ) {
      delete data.watchPercent
      delete data.watchSeconds
    }

    // if new value is less than previously recorded value, ditch new value
    if (
      typeof data.readPercent === 'number' &&
      progression.readPercent &&
      data.readPercent < progression.readPercent
    ) {
      delete data.readPercent
    }

    progression.merge(data)
    progression.isCompleted = this.isPercentCompleted(progression)

    await progression.save()

    return progression
  }

  /**
   * returns whether the provided history record has been completed
   * or is close enough to be considered completed
   * @param progression
   * @returns
   */
  isPercentCompleted(progression: Progress) {
    if (progression.isCompleted) return true

    if (
      typeof progression.watchPercent === 'number' &&
      progression.watchPercent >= this.completedPercentThreshold
    ) {
      return true
    }

    return (
      typeof progression.readPercent === 'number' &&
      progression.readPercent >= this.completedPercentThreshold
    )
  }
}
