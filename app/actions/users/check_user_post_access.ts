import BaseAction from '#actions/base_action'
import Post from '#models/post'
import PostPolicy from '#policies/post_policy'
import { HttpContext } from '@adonisjs/core/http'

export default class CheckUserPostAccess extends BaseAction {
  async asController({ response, auth, params, bouncer }: HttpContext) {
    response.header('content-type', 'application/json')

    if (!params.postId) {
      return response.json(auth.user?.isAdmin || auth.user?.isContributor)
    }

    const post = await Post.findOrFail(params.postId)
    const allowed = await bouncer.with(PostPolicy).allows('view', post)

    return response.json(allowed)
  }
}
