import RequestPriorities from 'App/Enums/RequestPriorities'
import States from 'App/Enums/States'
import LessonRequest from 'App/Models/LessonRequest'
import User from 'App/Models/User'
import LessonRequestStoreValidator from 'App/Validators/LessonRequestStoreValidator'

export default class LessonRequestService {
  /**
   * returns list of lesson requests
   */
  public static async getList() {
    return LessonRequest.query()
      .preload('user')
      .preload('votes', query => query.selectIds())
      .withCount('votes')
      .orderBy('createdAt', 'desc')
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
}
