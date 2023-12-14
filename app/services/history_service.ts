import User from '#models/user'
import History from '#models/history'
import { historyValidator } from "#validators/history_validator";
import { Infer } from '@vinejs/vine/types';
import HistoryTypes from "#enums/history_types";
import Post from "#models/post";
import Collection from "#models/collection";
import Taxonomy from "#models/taxonomy";
import NotImplementedException from "#exceptions/not_implemented_exception";
import States from "#enums/states";
import db from '@adonisjs/lucid/services/db';
import { HttpContext } from '@adonisjs/core/http';
import { inject } from '@adonisjs/core';

@inject()
export default class HistoryService {
  protected completedPercentThreshold = 90

  constructor(protected ctx: HttpContext) {}

  public get user() {
    return this.ctx.auth.user
  }

  /**
   * returns user's progression history for provided post
   * @param auth 
   * @param post 
   * @returns 
   */
  public async getPostProgression(post: Post) {
    if (!this.user) return
    return post.related('progressionHistory').query().where('userId', this.user!.id).orderBy('updatedAt', 'desc').first()
  }

  /**
   * records a view to the user's history for the provided record
   * @param user 
   * @param record 
   * @param routeName 
   * @returns 
   */
  public async recordView(record: Post | Collection | Taxonomy, routeName: string | undefined = undefined) {
    if (!this.user) return

    const idColumn = this.getRecordRelationColumn(record)

    return History.create({
      userId: this.user.id,
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
  public getRecordRelationColumn(record: Post | Collection | Taxonomy) {
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
  public async toggleComplete(data: Partial<History>) {
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
   * @param user 
   * @param routeName 
   * @param data 
   * @returns 
   */
  private async getProgressionOrNew(data: Partial<History>) {
    const query: Partial<History> = {
      userId: this.user!.id,
      historyTypeId: HistoryTypes.PROGRESSION
    }

    if (data.postId)        query.postId = data.postId
    if (data.collectionId)  query.collectionId = data.collectionId
    if (data.taxonomyId)    query.taxonomyId = data.taxonomyId

    return History.firstOrNew(query, {
      userId: this.user!.id,
      route: this.ctx.route?.name,
      historyTypeId: HistoryTypes.PROGRESSION
    })
  }

  /**
   * creates a new or updates the latest matching history progression record with new history event
   * @param user 
   * @param routeName 
   * @param data 
   * @returns 
   */
  public async recordProgression(data: Infer<typeof historyValidator>) {
    const progression = await this.getProgressionOrNew(user, routeName, data)

    // if new value is less than previously recorded value, ditch new value
    if (typeof data.watchSeconds === 'number' && progression.watchSeconds && data.watchSeconds < progression.watchSeconds) {
      delete data.watchPercent
      delete data.watchSeconds
    }

    // if new value is less than previously recorded value, ditch new value
    if (typeof data.readPercent === 'number' && progression.readPercent && data.readPercent < progression.readPercent) {
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
  public isPercentCompleted(progression: History) {
    if (progression.isCompleted) return true

    if (typeof progression.watchPercent === 'number' && progression.watchPercent >= this.completedPercentThreshold) {
      return true
    }

    return typeof progression.readPercent === 'number' && progression.readPercent >= this.completedPercentThreshold
  }

  public async getLatestSeriesProgress(limit: number | undefined = undefined) {
    const collectionIds = (await History.query()
      .where('historyTypeId', HistoryTypes.PROGRESSION)
      .where('userId', this.user!.id)
      .whereNotNull('collectionId')
      // .where(query => query
      //   .where('isCompleted', false)
      //   .orWhereHas('collection', query => query
      //     .whereHas('postsFlattened', query => query
      //       .whereDoesntHave('progressionHistory', query => query
      //         .where('userId', user.id)
      //         .where('isCompleted', true)
      //       )
      //     )
      //   )
      // )
      .orderBy('updatedAt', 'desc')
      .select('collectionId'))
      .map(r => r.collectionId)

    let distinctCollectionIds = [...new Set(collectionIds)]

    if (limit) {
      distinctCollectionIds = distinctCollectionIds.slice(0, limit)
    }

    const collections = await Collection.query()
      .preload('asset')
      .whereIn('id', distinctCollectionIds as number[])
      .withCount('postsFlattened', query => query.apply(scope => scope.published()).as('postCount'))
      .withCount('progressionHistory', query => query.where('userId', this.user!.id).where('isCompleted', true).as('postCompletedCount'))
      .preload('postsFlattened', query => query
        .preload('assets')
        .preload('series', query => query
          .where('stateId', States.PUBLIC)
          .groupLimit(1)
        )
        .preload('progressionHistory', query => query
          .where('userId', this.user!.id)
          .orderBy('updatedAt', 'desc')
          .groupLimit(1)
        )
        .whereDoesntHave('progressionHistory', query => query
          .where('userId', this.user!.id)
          .where('isCompleted', true)
        )
        .groupOrderBy('root_sort_order', 'asc')
        .groupLimit(1)
      )

    return collections.reduce((arr, item) => {
      arr[distinctCollectionIds.indexOf(item.id)] = item
      return arr
    }, [] as Collection[]).filter(Boolean)
  }

  public async getLatestPostProgress(limit: number | undefined = undefined) {
    const subQuery = db.knexQuery().from('histories')
      .select(db.knexRawQuery('MAX(updated_at) as updated_at'), 'post_id', 'user_id')
      .where('history_type_id', HistoryTypes.PROGRESSION)
      .groupBy('post_id', 'user_id')
      .as('h2')

    const latestHistoryPerPost = await db.knexQuery().from('histories as h1')
      .innerJoin(subQuery, query => query
        .on('h1.user_id', 'h2.user_id')
        .andOn('h1.post_id', 'h2.post_id')
        .andOn('h1.updated_at', 'h2.updated_at')
      )
      .where('h1.user_id', this.user!.id)
      .where('h1.history_type_id', HistoryTypes.PROGRESSION)
      .whereNotNull('h1.post_id')
      .where(query => query
        .where('h1.is_completed', true)
        .orWhere(query => query.whereNotNull('h1.watch_percent').where('h1.watch_percent', '>', 0))
        .orWhere(query => query.whereNotNull('h1.read_percent').where('h1.read_percent', '>', 0))
      )
      .select('h1.id', 'h1.post_id', 'h1.updated_at')
      .orderBy('h1.updated_at', 'desc')

    let distinctPostIds = [...new Set(latestHistoryPerPost.map((h: any) => h.post_id))] as number[]
    let distinctHistoryIds = [...new Set(latestHistoryPerPost.map((h: any) => h.id))] as number[]

    if (limit) {
      distinctPostIds = distinctPostIds.slice(0, limit)
    }

    const posts = await Post.query()
      .whereIn('id', distinctPostIds)
      .apply(scope => scope.forDisplay())
      .whereHas('progressionHistory', query => query.whereIn('id', distinctHistoryIds))
      .preload('progressionHistory', query => query
        .whereIn('id', distinctHistoryIds)
        .orderBy('updatedAt', 'desc')
        .groupLimit(1)
      )

    return posts.reduce((arr, item) => {
      arr[distinctPostIds.indexOf(item.id)] = item
      return arr
    }, [] as Post[]).filter(Boolean)
  }
}