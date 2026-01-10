import BaseAction from '#actions/base_action'
import States from '#enums/states'
import Comment from '#models/comment'
import Discussion from '#models/discussion'
import Progress from '#models/progress'
import User from '#models/user'

export default class GetUserStats extends BaseAction {
  async handle(user: User) {
    const userId = user.id

    return {
      // total lessons started or completed by user
      started: await Progress.build(user).get().for('postId').whereLesson().count(),

      // total lessons completed by user
      completed: await Progress.build(user)
        .for('postId')
        .whereLesson()
        .where({ isCompleted: true })
        .count(),

      // total seconds watched by user
      seconds: await Progress.build(user).get().for('postId').whereLesson().sum('watch_seconds'),

      // total comments made by user
      comments: await Comment.query().where({ userId, stateId: States.PUBLIC }).getCount(),

      // total discussions started by user
      discussions: await Discussion.query().where({ userId, stateId: States.PUBLIC }).getCount(),
    }
  }
}
