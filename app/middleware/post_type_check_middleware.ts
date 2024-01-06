import Post from '#models/post'
import type { HttpContext } from '@adonisjs/core/http'
import type { NextFn } from '@adonisjs/core/types/http'

export default class PostTypeCheckMiddleware {
  async handle({ request, response, params }: HttpContext, next: NextFn) {
    const post = await Post.findByOrFail('slug', params.slug)

    if (!request.url().toLowerCase().includes(post.routeUrl.toLowerCase())) {
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

