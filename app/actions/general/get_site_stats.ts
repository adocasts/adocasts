import BaseAction from '#actions/base_action'
import Comment from '#models/comment'
import Discussion from '#models/discussion'
import Post from '#models/post'
import Progress from '#models/progress'
import User from '#models/user'
import cache from '@adonisjs/cache/services/main'

export default class GetSiteStats extends BaseAction {
  async handle() {
    return cache.getOrSet({
      key: 'SITE_STATS',
      ttl: '30 minutes',
      factory: async () => this.#get(),
    })
  }

  async #get() {
    return {
      lessons: await Post.build().count(),
      completed: await Progress.build().where({ isCompleted: true }).count(),
      users: await User.query().getCount(),
      comments: await Comment.query().getCount(),
      discussions: await Discussion.query().getCount(),
    }
  }
}
