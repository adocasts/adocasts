import RequestPriorities from '#enums/request_priorities'
import States from '#enums/states'
import LessonRequest from '#models/lesson_request'
import User from '#models/user'
import {
  lessonRequestSearchValidator,
  lessonRequestStoreValidator,
  lessonRequestUpdateStateValidator,
} from '#validators/lesson_request_validator'
import Comment from '#models/comment'
import CommentTypes from '#enums/comment_types'
import NotImplementedException from '#exceptions/not_implemented_exception'
import LessonRequestQueryBuilder from '#builders/lesson_request_builder'
import LessonRequestPaginatedQueryBuilder from '#builders/lesson_request_paginated_builder'
import IdentityService from '#services/identity_service'
import db from '@adonisjs/lucid/services/db'
import { TransactionClientContract } from '@adonisjs/lucid/types/database'
import sanitizeHtml from 'sanitize-html'
import { DateTime } from 'luxon'
import { Infer } from '@vinejs/vine/types'
import { inject } from '@adonisjs/core'
import { HttpContext } from '@adonisjs/core/http'

@inject()
export default class LessonRequestService {
  static perPage = 3

  constructor(protected ctx: HttpContext) {}

  private getDisplayBaseQuery() {
    return LessonRequest.query()
      .preload('user')
      .preload('votes', (query) => query.select('id'))
      .withCount('votes')
      .withCount('comments')
      .orderBy('updatedAt', 'desc')
  }

  /**
   * returns list of lesson requests
   * @param limit
   * @returns
   */
  async getList(limit = 20) {
    const query = new LessonRequestQueryBuilder()
    return query.setLimit(limit).build()
  }

  /**
   * returns lesson request matching given id
   * @param id
   * @returns
   */
  async get(id: number) {
    return this.getDisplayBaseQuery().where({ id }).firstOrFail()
  }

  /**
   * returns paginated list of lesson requests
   */
  async getPaginatedList(records: Record<string, any>, baseUrl?: string) {
    const { page = 1, pattern = '', sortBy = 'updatedAt_desc', state = null } = records
    const query = new LessonRequestPaginatedQueryBuilder(baseUrl)

    return query
      .setPage(page)
      .setSort(sortBy)
      .wherePattern(pattern)
      .whereState(state)
      .whereNotState(States.ARCHIVED)
      .preloadRelations()
      .build()
  }

  /**
   * returns lesson requests matching search payload
   * @param param0
   * @returns
   */
  async search(
    { pattern, sortBy, state }: Infer<typeof lessonRequestSearchValidator>,
    baseUrl?: string
  ) {
    const query = new LessonRequestPaginatedQueryBuilder(baseUrl)

    return query.setSort(sortBy).wherePattern(pattern).whereState(state).preloadRelations().build()
  }

  /**
   * returns comments for post
   * @param auth
   * @param post
   * @returns
   */
  async getComments(lessonRequest: LessonRequest) {
    return lessonRequest
      .related('comments')
      .query()
      .where((query) => query.where('stateId', States.PUBLIC).orWhere('stateId', States.ARCHIVED))
      .preload('user')
      .preload('userVotes', (query) => query.select(['id']))
      .orderBy('createdAt', 'desc')
  }

  static async getCommentsReload(lessonRequestId: number) {
    const query = Comment.query().where({ lessonRequestId })
    const comments = await query
      .clone()
      .where((q2) => q2.where('stateId', States.PUBLIC).orWhere('stateId', States.ARCHIVED))
      .preload('user')
      .preload('userVotes', (votes) => votes.select(['id']))
      .orderBy('createdAt', 'desc')

    const commentCountResult = await query
      .clone()
      .where('stateId', States.PUBLIC)
      .count('*', 'total')
      .first()

    const commentCount = commentCountResult?.$extras.total

    return { comments, commentCount }
  }

  /**
   * returns a count of the comments tied to the post
   * @param post
   * @returns
   */
  async getCommentsCount(lessonRequest: LessonRequest) {
    const totalResult = await lessonRequest
      .related('comments')
      .query()
      .where('stateId', States.PUBLIC)
      .count('*', 'total')
      .first()

    return totalResult?.$extras.total
  }

  /**
   * create a new lesson request
   * @param user
   * @param param1
   * @returns
   */
  async store(
    user: User,
    { nonDuplicate, ...data }: Infer<typeof lessonRequestStoreValidator>,
    trx: TransactionClientContract | undefined = undefined
  ) {
    return LessonRequest.create(
      {
        ...data,
        userId: user.id,
        stateId: States.IN_REVIEW,
        priority: RequestPriorities.NORMAL, // TODO: use elevated when from a subscription user
      },
      { client: trx }
    )
  }

  /**
   * toggles users vote state on request
   * @param user
   * @param id
   * @returns
   */
  async toggleVote(user: User, id: number) {
    const lessonRequest = await LessonRequest.findOrFail(id)
    const hasVotedResult = await lessonRequest
      .related('votes')
      .query()
      .where('users.id', user.id)
      .select('id')

    const hasVoted = hasVotedResult.length

    hasVoted
      ? await lessonRequest.related('votes').detach([user.id])
      : await lessonRequest.related('votes').attach({
          [user.id]: {
            created_at: DateTime.now().toSQL(),
            updated_at: DateTime.now().toSQL(),
          },
        })

    await lessonRequest.load('votes', (query) => query.select('id'))
    await lessonRequest.loadCount('votes')

    return lessonRequest
  }

  /**
   * approves the provided lesson request
   * @param lessonRequest
   */
  async approve(lessonRequest: LessonRequest) {
    return this.updateState(lessonRequest, States.IN_PROGRESS)
  }

  /**
   * rejects the provided lesson request
   * @param lessonRequest
   */
  async reject(lessonRequest: LessonRequest) {
    return this.updateState(lessonRequest, States.DECLINED)
  }

  /**
   * marks the provided lesson request as completed
   * @param lessonRequest
   */
  async complete(lessonRequest: LessonRequest) {
    return this.updateState(lessonRequest, States.PUBLIC)
  }

  /**
   * updates the lesson request state and, if provided, attaches an update comment
   * @param request
   * @param user
   * @param lessonRequest
   * @param stateId
   */
  private async updateState(lessonRequest: LessonRequest, stateId: States) {
    const data = await this.ctx.request.validateUsing(lessonRequestUpdateStateValidator)
    const commentColumn = await this.getStateCommentColumn(stateId)
    const trx = await db.transaction()
    let commentId: null | number = null

    lessonRequest.useTransaction(trx)

    if (data.comment) {
      const comment = await this.comment(lessonRequest, data.comment, trx)
      commentId = comment.id
    }

    await lessonRequest
      .merge({
        [commentColumn]: commentId,
        stateId,
      })
      .save()

    await trx.commit()
  }

  /**
   * returns the appropriate lesson request column for the provided state id
   * @param stateId
   * @returns
   */
  private async getStateCommentColumn(stateId: States) {
    switch (stateId) {
      case States.PUBLIC:
        return 'completeCommentId'
      case States.DECLINED:
        return 'rejectCommentId'
      case States.IN_PROGRESS:
        return 'approveCommentId'
      default:
        throw new NotImplementedException(
          `Lesson requests have not yet implemented the state ${stateId}`
        )
    }
  }

  /**
   * creates comment for the provided lesson request state change
   * @param request
   * @param user
   * @param body
   * @param trx
   * @returns
   */
  private async comment(
    lessonRequest: LessonRequest,
    body: string,
    trx: TransactionClientContract
  ) {
    const comment = new Comment()
    const identity = await IdentityService.getRequestIdentity(this.ctx.request)

    comment.useTransaction(trx)

    comment.merge({
      lessonRequestId: lessonRequest.id,
      commentTypeId: CommentTypes.LESSON_REQUEST,
      identity,
      body: sanitizeHtml(body),
      userId: this.ctx.auth.user!.id,
      stateId: States.PUBLIC,
    })

    await comment.save()

    return comment
  }
}
