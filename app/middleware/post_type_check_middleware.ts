import Post from '#models/post'
import type { HttpContext } from '@adonisjs/core/http'
import type { NextFn } from '@adonisjs/core/types/http'

export default class PostTypeCheckMiddleware {
  async handle({ request, response, params }: HttpContext, next: NextFn) {
    // gracefully handle encoded #
    if (params.slug.includes('%23')) {
      params.slug = params.slug.split('%23').at(0)
    }

    const post = await Post.findBy('slug', params.slug)

    if (post && !request.url().toLowerCase().includes(post.routeUrl.toLowerCase())) {
      response.redirect(post.routeUrl)
      return
    }

    /**
     * Call next method in the pipeline and return its output
     */
    const output = await next()
    return output
  }
}
