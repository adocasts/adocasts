import States from "App/Enums/States";
import CommentVote from "App/Models/CommentVote";
import User from "App/Models/User";
import ActivityVM from "App/ViewModels/Activity";
import { DateTime } from "luxon";

export default class ProfileActivityService {
  constructor(protected user: User, protected start: DateTime = DateTime.now().startOf('day').minus({ month: 12 })) {}

  public get startSql() {
    return this.start.toSQL()
  }

  public async getActivity() {
    const account = await this.getAccountActivity()
    const posts = await this.getPostActivity()
    const comments = await this.getCommentActivity()
    const commentVotes = await this.getCommentUpvotes()
    const completedLessons = await this.getCompletedLessons()
    const requestedLessons = await this.getRequestedLessons()
    const requestedLessonVotes = await this.getRequestedLessonUpvotes()
    
    return [
      ...account,
      ...posts,
      ...comments,
      ...commentVotes,
      ...completedLessons,
      ...requestedLessons,
      ...requestedLessonVotes,
    ].sort((a, b) => b.createdAt.toMillis() - a.createdAt.toMillis())
  }

  public getAccountActivity() {
    const activity: ActivityVM[] = []
    
    // account created
    if (this.user.createdAt >= this.start) {
      activity.push(ActivityVM.getForUserCreated(this.user))
    }

    // anniversary
    const yearsSinceLaunch = Math.floor(DateTime.now().diff(DateTime.fromFormat('2021-01-01', 'yyyy-MM-dd'), 'years').years)
    for (let i = 1; i <= yearsSinceLaunch; i++) {
      const anniversary = this.user.createdAt.plus({ years: i })
      if (anniversary >= this.start && anniversary <= DateTime.now().endOf('day')) {
        activity.push(ActivityVM.getForUserAnniversary(this.user, i))
      }
    }

    return activity
  }

  public async getPostActivity() {
    const posts = await this.user.related('posts').query()
      .where('publishAt', '>=', this.startSql)
      .wherePublic()
      
    return posts.map(post => new ActivityVM({ post }))
  }

  public async getCommentActivity() {
    const comments = await this.user.related('comments').query()
      .where('createdAt', '>=', this.startSql)
      .preload('post')
      .preload('lessonRequest')
      .preload('parent', query => query.preload('user'))

    return comments.map(comment => new ActivityVM({ comment }))
  }

  public async getCommentUpvotes() {
    const votes = await CommentVote.query()
      .where('userId', this.user.id)
      .where('createdAt', '>=', this.startSql)
      .preload('comment', query => query.preload('post').preload('lessonRequest'))
    
    return votes.map(commentVote => new ActivityVM({ commentVote }))
  }

  public async getCompletedLessons() {
    const histories = await this.user.related('completedPosts').query()
      .where('createdAt', '>=', this.startSql)
      .preload('post')

    return histories.map(history => new ActivityVM({ history }))
  }

  public async getRequestedLessons() {
    const requests = await this.user.related('lessonRequests').query()
      .where('createdAt', '>=', this.startSql)
      .whereNot('stateId', States.ARCHIVED)

    return requests.map(lessonRequest => new ActivityVM({ lessonRequest }))
  }

  public async getRequestedLessonUpvotes() {
    const upvotes = await this.user.related('lessonRequestVotes').query()
      .where('createdAt', '>=', this.startSql)
      .whereHas('lessonRequest', query => query.whereNot('stateId', States.ARCHIVED))
      .preload('lessonRequest')

    return upvotes.map(requestVote => new ActivityVM({ requestVote }))
  }
}