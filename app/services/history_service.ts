import User from '#models/user'
import History from '#models/history'
import HistoryTypes from '#enums/history_types'
import Post from '#models/post'
import Collection from '#models/collection'
import Taxonomy from '#models/taxonomy'
import NotImplementedException from '#exceptions/not_implemented_exception'
import { HttpContext } from '@adonisjs/core/http'
import { inject } from '@adonisjs/core'
import { SeriesShowVM } from '../view_models/series.js'
import { TopicListVM } from '../view_models/topic.js'
import { PostShowVM } from '../view_models/post.js'

@inject()
export default class HistoryService {
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
    return HistoryService.getPostProgression(this.user, post)
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
   * records a view to the user's history for the provided record
   * @param user
   * @param record
   * @param routeName
   * @returns
   */
  async recordView(
    record: Post | Collection | Taxonomy | SeriesShowVM | TopicListVM | PostShowVM,
    routeName: string | undefined = undefined
  ) {
    if (!this.user) return

    const idColumn = this.getRecordRelationColumn(record)

    return History.create({
      userId: this.user.id,
      route: routeName,
      historyTypeId: HistoryTypes.VIEW,
      [idColumn]: record.id,
    })
  }

  /**
   * returns the History column name for the provided relation record
   * @param record
   * @returns
   */
  getRecordRelationColumn(record: Post | Collection | Taxonomy | SeriesShowVM | TopicListVM | PostShowVM) {
    switch (true) {
      case record instanceof Post:
      case record instanceof PostShowVM:
        return 'postId'
      case record instanceof Collection:
      case record instanceof SeriesShowVM:
        return 'collectionId'
      case record instanceof Taxonomy:
      case record instanceof TopicListVM:
        return 'taxonomyId'
      default:
        throw new NotImplementedException(
          `HistoryService.recordView has not yet implemented support for record of type: ${record}`
        )
    }
  }
}
