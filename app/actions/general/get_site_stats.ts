import BaseAction from '#actions/base_action'
import CacheKeys from '#enums/cache_keys'
import States from '#enums/states'
import Comment from '#models/comment'
import Discussion from '#models/discussion'
import Post from '#models/post'
import Progress from '#models/progress'
import User from '#models/user'
import cache from '@adonisjs/cache/services/main'

export default class GetSiteStats extends BaseAction {
  async handle() {
    return cache.getOrSet({
      key: CacheKeys.SITE_STATS,
      ttl: '30 minutes',
      factory: async () => this.#get(),
    })
  }

  async #get() {
    return {
      // public and published posts
      lessons: await Post.build().whereLesson().published().count(),

      // total number of user completed lessons
      completed: await Progress.build().where({ isCompleted: true }).whereNotNull('postId').count(),

      // total number of registered users
      users: await User.query().getCount(),

      // total number of public comments
      comments: await Comment.query().where('stateId', States.PUBLIC).getCount(),

      // total number of public discussions
      discussions: await Discussion.query().where('stateId', States.PUBLIC).getCount(),
    }
  }
}
