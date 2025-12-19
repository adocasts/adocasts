import BaseAction from '#actions/base_action'
import Post from '#models/post'
import PostPolicy from '#policies/post_policy'
import { HttpContext } from '@adonisjs/core/http'

export default class CheckUserPostAccess extends BaseAction {
  async asController({ auth, params, bouncer }: HttpContext) {
    if (!params.postId) {
      return auth.user?.isAdmin || auth.user?.isContributor
    }

    const post = await Post.findOrFail(params.postId)
    const allowed = await bouncer.with(PostPolicy).allows('view', post)

    return allowed
  }
}
