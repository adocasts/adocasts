import BaseAction from '#actions/base_action'
import Comment from '#models/comment'
import Discussion from '#models/discussion'
import Progress from '#models/progress'
import User from '#models/user'

export default class GetUserStats extends BaseAction<[User]> {
  async handle(user: User) {
    const userId = user.id

    return {
      started: await Progress.build().get().where({ userId }).count(),
      completed: await Progress.build().where({ userId, isCompleted: true }).count(),
      seconds: await Progress.build().get().where({ userId }).sum('watch_seconds'),
      comments: await Comment.query().where({ userId }).getCount(),
      discussions: await Discussion.query().where({ userId }).getCount(),
    }
  }
}
