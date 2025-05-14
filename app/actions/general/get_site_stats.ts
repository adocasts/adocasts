import BaseAction from '#actions/base_action'
import Comment from '#models/comment'
import Post from '#models/post'
import Progress from '#models/progress'
import User from '#models/user'

export default class GetSiteStats extends BaseAction {
  async handle() {
    return {
      lessons: await Post.build().count(),
      completed: await Progress.build().where({ isCompleted: true }).count(),
      users: await User.query().getCount(),
      comments: await Comment.query().getCount(),
    }
  }
}
