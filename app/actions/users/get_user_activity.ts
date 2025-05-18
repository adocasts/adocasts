import BaseAction from '#actions/base_action'
import ActivityDto from '#dtos/activity'
import States from '#enums/states'
import CommentVote from '#models/comment_vote'
import DiscussionVote from '#models/discussion_vote'
import User from '#models/user'
import { DateTime } from 'luxon'

export default class GetUserActivity extends BaseAction<[User]> {
  start = DateTime.now().startOf('day').minus({ months: 12 })

  get startSql() {
    return this.start.toSQL()
  }

  async handle(user: User) {
    const account = await this.accountActivity(user)
    const posts = await this.postActivity(user)
    const discussions = await this.discussionActivity(user)
    const discussionVotes = await this.discussionUpvotes(user)
    const comments = await this.commentActivity(user)
    const commentVotes = await this.commentUpvotes(user)
    const completedLessons = await this.lessonsCompleted(user)
    const requestedLessons = await this.lessonRequests(user)
    const requestedLessonVotes = await this.lessonRequestUpvotes(user)

    return [
      ...account,
      ...posts,
      ...discussions,
      ...discussionVotes,
      ...comments,
      ...commentVotes,
      ...completedLessons,
      ...requestedLessons,
      ...requestedLessonVotes,
    ].sort((a, b) => b.createdAt.toMillis() - a.createdAt.toMillis())
  }

  accountActivity(user: User) {
    const activity: ActivityDto[] = []

    // account created
    if (user!.createdAt >= this.start) {
      activity.push(ActivityDto.getForUserCreated(user))
    }

    // anniversary
    const yearsSinceLaunch = Math.floor(
      DateTime.now().diff(DateTime.fromFormat('2021-01-01', 'yyyy-MM-dd'), 'years').years
    )
    for (let i = 1; i <= yearsSinceLaunch; i++) {
      const anniversary = user.createdAt.plus({ years: i })
      if (anniversary >= this.start && anniversary <= DateTime.now().endOf('day')) {
        activity.push(ActivityDto.getForUserAnniversary(user, i))
      }
    }

    return activity
  }

  async postActivity(user: User) {
    const posts = await user
      .related('posts')
      .query()
      .where('publishAt', '>=', this.startSql!)
      .where('stateId', States.PUBLIC)

    return posts.map((post) => new ActivityDto({ post }))
  }

  async discussionActivity(user: User) {
    const discussions = await user
      .related('discussions')
      .query()
      .where('createdAt', '>=', this.startSql!)
      .where('stateId', States.PUBLIC)

    return discussions.map((discussion) => new ActivityDto({ discussion }))
  }

  async discussionUpvotes(user: User) {
    const votes = await DiscussionVote.query()
      .where('userId', user.id)
      .where('createdAt', '>=', this.startSql!)
      .preload('discussion')

    return votes.map((discussionVote) => new ActivityDto({ discussionVote }))
  }

  async commentActivity(user: User) {
    const comments = await user
      .related('comments')
      .query()
      .where('createdAt', '>=', this.startSql!)
      .preload('post')
      .preload('lessonRequest')
      .preload('discussion')
      .preload('parent', (query) => query.preload('user'))

    return comments.map((comment) => new ActivityDto({ comment }))
  }

  async commentUpvotes(user: User) {
    const votes = await CommentVote.query()
      .where('userId', user.id)
      .where('createdAt', '>=', this.startSql!)
      .preload('comment', (query) => query.preload('post').preload('lessonRequest'))

    return votes.map((commentVote) => new ActivityDto({ commentVote }))
  }

  async lessonsCompleted(user: User) {
    const histories = await user
      .related('completedPosts')
      .query()
      .where('createdAt', '>=', this.startSql!)
      .preload('post')

    return histories.map((history) => new ActivityDto({ history }))
  }

  async lessonRequests(user: User) {
    const requests = await user
      .related('lessonRequests')
      .query()
      .where('createdAt', '>=', this.startSql!)
      .whereNot('stateId', States.ARCHIVED)

    return requests.map((lessonRequest) => new ActivityDto({ lessonRequest }))
  }

  async lessonRequestUpvotes(user: User) {
    const upvotes = await user
      .related('lessonRequestVotes')
      .query()
      .where('createdAt', '>=', this.startSql!)
      .whereHas('lessonRequest', (query) => query.whereNot('stateId', States.ARCHIVED))
      .preload('lessonRequest')

    return upvotes.map((requestVote) => new ActivityDto({ requestVote }))
  }
}
