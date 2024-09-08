import Plans from '#enums/plans'
import States from '#enums/states'
import Discussion from '#models/discussion'
import Taxonomy from '#models/taxonomy'
import User from '#models/user'
import { inject } from '@adonisjs/core'
import { HttpContext } from '@adonisjs/core/http'
import { DateTime } from 'luxon'
import bento from './bento_service.js'
import CacheNamespaces from '#enums/cache_namespaces'
import Roles from "#enums/roles";

@inject()
export default class DiscussionService {
  constructor(protected ctx: HttpContext) {}

  get cache() {
    return bento.namespace(CacheNamespaces.FEED)
  }

  /**
   * Retrieves a discussion by its slug.
   *
   * @param {string} slug - The slug of the discussion.
   * @return {Promise<Discussion>} A promise that resolves to the discussion.
   */
  async getBySlug(slug: string) {
    return Discussion.query()
      .preload('user', (query) => query.preload('profile'))
      .preload('taxonomy', (query) => query.preload('asset'))
      .preload('votes', (query) => query.select('id'))
      .withCount('comments', (query) => query.where('stateId', States.PUBLIC).as('commentsCount'))
      .withCount('views')
      .withCount('impressions')
      .where('slug', slug)
      .where('stateId', States.PUBLIC)
      .firstOrFail()
  }

  /**
   * Retrieves the comments associated with a discussion.
   *
   * @param {Discussion} discussion - The discussion object for which to retrieve the comments.
   * @return {Promise<Comment[]>} - A promise that resolves to an array of comments.
   */
  async getComments(discussion: Discussion) {
    return discussion
      .related('comments')
      .query()
      .withCount('userVotes', (query) => query.as('voteCount'))
      .where('stateId', States.PUBLIC)
      .orderBy([
        { column: 'voteCount', order: 'desc' },
        { column: 'createdAt', order: 'asc' },
      ])
      .preload('user')
      .preload('userVotes', (query) => query.select('id'))
  }

  async getAsideList(limit: number = 10, taxonomyIds?: number[]) {
    const discussions = await Discussion.query()
      .if(taxonomyIds, (query) => query.whereIn('taxonomyId', taxonomyIds!))
      .preload('user', (query) => query.preload('profile'))
      .preload('taxonomy', (query) => query.preload('asset'))
      .preload('votes', (query) => query.select('id'))
      .whereHas('user', (query) => query.where('planId', '!=', Plans.FREE).whereNot('roleId', Roles.ADMIN))
      .where('stateId', States.PUBLIC)
      .withCount('comments', (query) => query.where('stateId', States.PUBLIC).as('commentCount'))
      .withCount('views')
      .withCount('impressions')
      .preload('comments', (query) =>
        query
          .preload('user')
          .where('stateId', States.PUBLIC)
          .orderBy('createdAt', 'desc')
          .groupLimit(2)
      )
      .orderBy('createdAt', 'desc')
      .limit(limit)

    // not enough plus posts to fill space? pull in from everyone else
    if (discussions.length < limit) {
      const ids = discussions.map((discussion) => discussion.id)
      const moreDiscussions = await await Discussion.query()
        .if(taxonomyIds, (query) => query.whereIn('taxonomyId', taxonomyIds!))
        .whereNotIn('id', ids)
        .preload('user', (query) => query.preload('profile'))
        .preload('taxonomy', (query) => query.preload('asset'))
        .preload('votes', (query) => query.select('id'))
        .where('stateId', States.PUBLIC)
        .withCount('comments', (query) => query.where('stateId', States.PUBLIC).as('commentCount'))
        .withCount('views')
        .withCount('impressions')
        .preload('comments', (query) =>
          query
            .preload('user')
            .where('stateId', States.PUBLIC)
            .orderBy('createdAt', 'desc')
            .groupLimit(2)
        )
        .orderBy('createdAt', 'desc')
        .limit(limit - discussions.length)

      discussions.push(...moreDiscussions)
    }

    return discussions
  }

  async getPaginated(filters?: Record<string, any>) {
    const page = filters?.page ?? 1
    return Discussion.query()
      .if(filters?.pattern, (truthy) =>
        truthy.where((query) =>
          query
            .whereILike('title', `%${filters!.pattern}%`)
            .orWhereILike('body', `%${filters!.pattern}%`)
            .if(filters!.pattern.startsWith('@'), (startsWith) =>
              startsWith.orWhereHas('user', (orHas) =>
                orHas.whereILike('username', `%${filters!.pattern.replace('@', '')}%`)
              )
            )
        )
      )
      .if(filters?.topic, (query) =>
        query.whereHas('taxonomy', (q2) => q2.where('slug', filters!.topic!))
      )
      .preload('user', (query) => query.preload('profile'))
      .preload('taxonomy', (query) => query.preload('asset'))
      .preload('votes', (query) => query.select('id'))
      .where('stateId', States.PUBLIC)
      .withCount('comments', (query) => query.where('stateId', States.PUBLIC).as('commentCount'))
      .withCount('views')
      .withCount('impressions')
      .preload('comments', (query) =>
        query
          .preload('user')
          .where('stateId', States.PUBLIC)
          .orderBy('createdAt', 'desc')
          .groupLimit(2)
      )
      .orderBy('createdAt', 'desc')
      .paginate(page, 20)
  }

  async getUserPaginated(userId: number, filters?: Record<string, any>) {
    const page = filters?.page ?? 1
    return Discussion.query()
      .if(filters?.pattern, (query) =>
        query.where((q2) =>
          q2
            .whereILike('title', `%${filters!.pattern}%`)
            .orWhereILike('body', `%${filters!.pattern}%`)
        )
      )
      .if(filters?.topic, (query) =>
        query.whereHas('taxonomy', (q2) => q2.where('slug', filters!.topic!))
      )
      .preload('user', (query) => query.preload('profile'))
      .preload('taxonomy', (query) => query.preload('asset'))
      .preload('votes', (query) => query.select('id'))
      .where('stateId', States.PUBLIC)
      .where('userId', userId)
      .withCount('comments', (query) => query.where('stateId', States.PUBLIC).as('commentCount'))
      .withCount('views')
      .withCount('impressions')
      .preload('comments', (query) =>
        query
          .preload('user')
          .where('stateId', States.PUBLIC)
          .orderBy('createdAt', 'desc')
          .groupLimit(2)
      )
      .orderBy('createdAt', 'desc')
      .paginate(page, 20)
  }

  /**
   * Retrieves the topics from the database.
   *
   * @return {Promise<Array<{id: number, name: string}>>} A promise that resolves to an array of topic objects containing the id and name.
   */
  async getTopics() {
    return Taxonomy.query().orderBy('name').select('id', 'name', 'slug')
  }

  /**
   * toggles users vote state on request
   * @param user
   * @param id
   * @returns
   */
  async toggleVote(user: User, id: number) {
    const discussion = await Discussion.findOrFail(id)
    const hasVotedResult = await discussion
      .related('votes')
      .query()
      .where('users.id', user.id)
      .select('id')

    const hasVoted = hasVotedResult.length

    hasVoted
      ? await discussion.related('votes').detach([user.id])
      : await discussion.related('votes').attach({
          [user.id]: {
            created_at: DateTime.now().toSQL(),
            updated_at: DateTime.now().toSQL(),
          },
        })

    await discussion.load('votes', (query) => query.select('id'))
    await discussion.loadCount('votes')

    return discussion
  }
}
