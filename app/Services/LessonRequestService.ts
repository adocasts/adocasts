import RequestPriorities from 'App/Enums/RequestPriorities'
import States from 'App/Enums/States'
import LessonRequest from 'App/Models/LessonRequest'
import User from 'App/Models/User'
import LessonRequestStoreValidator from 'App/Validators/LessonRequestStoreValidator'
import LessonRequestUpdateStateValidator from 'App/Validators/LessonRequestUpdateStateValidator'
import { RequestContract } from '@ioc:Adonis/Core/Request'
import Database, { TransactionClientContract } from '@ioc:Adonis/Lucid/Database'
import IdentityService from './IdentityService'
import Comment from 'App/Models/Comment'
import sanitizeHtml from 'sanitize-html'
import CommentTypes from 'App/Enums/CommentTypes'
import NotImplementedException from 'App/Exceptions/NotImplementedException'
import LessonRequestSearchValidator from 'App/Validators/LessonRequestSearchValidator'
import LessonRequestQueryBuilder from 'App/QueryBuilders/LessonRequest'
import LessonRequestPaginatedQueryBuilder from 'App/QueryBuilders/LessonRequestPaginated'

export default class LessonRequestService {
  public static perPage = 3

  private static getDisplayBaseQuery() {
    return LessonRequest.query()
      .preload('user')
      .preload('votes', query => query.selectIds())
      .withCount('votes')
      .withCount('comments')
      .orderBy('updatedAt', 'desc')
  }

  /**
   * returns list of lesson requests
   * @param limit 
   * @returns 
   */
  public static async getList(limit = 20) {
    const query = new LessonRequestQueryBuilder()
    return query.setLimit(limit).build()
  }

  /**
   * returns lesson request matching given id
   * @param id 
   * @returns 
   */
  public static async get(id: number) {
    return this.getDisplayBaseQuery()
      .where({ id })
      .highlightOrFail()
  }

  /**
   * returns paginated list of lesson requests
   */
  public static async getPaginatedList(records: Record<string, any>, baseUrl?: string) {
    const { page = 1, pattern = '', sortBy = 'updatedAt_desc', state = null } = records
    const query = new LessonRequestPaginatedQueryBuilder(baseUrl)

    return query
      .setPage(page)
      .setSort(sortBy)
      .wherePattern(pattern)
      .whereState(state)
      .preloadRelations()
      .build()
  }

  /**
   * returns lesson requests matching search payload
   * @param param0 
   * @returns 
   */
  public static async search({ pattern, sortBy, state }: LessonRequestSearchValidator['schema']['props'], baseUrl?: string) {
    const query = new LessonRequestPaginatedQueryBuilder(baseUrl)

    return query
      .setSort(sortBy)
      .wherePattern(pattern)
      .whereState(state)
      .preloadRelations()
      .build()
  }

  /**
   * returns comments for post
   * @param auth 
   * @param post 
   * @returns 
   */
  public static async getComments(lessonRequest: LessonRequest) {
    return lessonRequest.related('comments').query()
      .where(query => query.wherePublic().orWhere('stateId', States.ARCHIVED))
      .preload('user')
      .preload('userVotes', query => query.select(['id']))
      .orderBy('createdAt', 'desc')
      .highlightAll()
  }

  /**
   * returns a count of the comments tied to the post
   * @param post 
   * @returns 
   */
  public static async getCommentsCount(lessonRequest: LessonRequest) {
    return lessonRequest.related('comments').query()
      .wherePublic()
      .getCount()
  }

  /**
   * create a new lesson request
   * @param user 
   * @param param1 
   * @returns 
   */
  public static async store(user: User, { nonDuplicate, ...data }: LessonRequestStoreValidator['schema']['props']) {
    return LessonRequest.create({
      ...data,
      userId: user.id,
      stateId: States.IN_REVIEW,
      priority: RequestPriorities.NORMAL // TODO: use elevated when from a subscription user
    })
  }

  /**
   * toggles users vote state on request
   * @param user 
   * @param id 
   * @returns 
   */
  public static async toggleVote(user: User, id: number) {
    const lessonRequest = await LessonRequest.findOrFail(id)
    const hasVoted = await lessonRequest.related('votes').query().where('users.id', user.id).any()

    hasVoted
      ? await lessonRequest.related('votes').detach([user.id])
      : await lessonRequest.related('votes').attach([user.id])
      
    await lessonRequest.load('votes', query => query.selectIds())
    await lessonRequest.loadCount('votes')

    return lessonRequest
  }

  /**
   * approves the provided lesson request
   * @param user 
   * @param lessonRequest 
   * @param param2 
   */
  public static async approve(request: RequestContract, user: User, lessonRequest: LessonRequest) {
    return this.updateState(request, user, lessonRequest, States.IN_PROGRESS)
  }

  /**
   * rejects the provided lesson request
   * @param user 
   * @param lessonRequest 
   * @param param2 
   */
  public static async reject(request: RequestContract, user: User, lessonRequest: LessonRequest) {
    return this.updateState(request, user, lessonRequest, States.DECLINED)
  }

  /**
   * marks the provided lesson request as completed
   * @param user 
   * @param lessonRequest 
   * @param param2 
   */
  public static async complete(request: RequestContract, user: User, lessonRequest: LessonRequest) {
    return this.updateState(request, user, lessonRequest, States.PUBLIC)
  }

  /**
   * updates the lesson request state and, if provided, attaches an update comment
   * @param request 
   * @param user 
   * @param lessonRequest 
   * @param stateId 
   */
  private static async updateState(request: RequestContract, user: User, lessonRequest: LessonRequest, stateId: States) {
    const data = await request.validate(LessonRequestUpdateStateValidator)
    const commentColumn = await this.getStateCommentColumn(stateId)
    const trx = await Database.transaction()
    let commentId: null | number = null

    lessonRequest.useTransaction(trx)
    
    if (data.comment) {
      const comment = await this.comment(request, user, lessonRequest, data.comment, trx)
      commentId = comment.id
    }

    await lessonRequest.merge({
      [commentColumn]: commentId,
      stateId
    }).save()

    await trx.commit()
  }

  /**
   * returns the appropriate lesson request column for the provided state id
   * @param stateId 
   * @returns 
   */
  private static async getStateCommentColumn(stateId: States) {
    switch (stateId) {
      case States.PUBLIC:
        return "completeCommentId"
      case States.DECLINED:
        return "rejectCommentId"
      case States.IN_PROGRESS:
        return "approveCommentId"
      default:
        throw new NotImplementedException(`Lesson requests have not yet implemented the state ${stateId}`)
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
  private static async comment(request: RequestContract, user: User, lessonRequest: LessonRequest, body: string, trx: TransactionClientContract) {
    const comment = new Comment()
    const identity = await IdentityService.getRequestIdentity(request)

    comment.useTransaction(trx)

    comment.merge({
      lessonRequestId: lessonRequest.id,
      commentTypeId: CommentTypes.LESSON_REQUEST,
      identity,
      body: sanitizeHtml(body),
      userId: user.id,
      stateId: States.PUBLIC
    })

    await comment.save()

    return comment
  }
}
