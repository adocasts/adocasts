import { HttpContextContract } from '@ioc:Adonis/Core/HttpContext'
import Post from 'App/Models/Post'

export default class PostTypeCheck {
  constructor() {}

  public async handle({ params, request, response }: HttpContextContract, next: () => Promise<void>) {
    // code for middleware goes here. ABOVE THE NEXT CALL
    const post = await Post.findByOrFail('slug', params.slug)

    if (!request.url().toLowerCase().startsWith(post.routeUrl.toLowerCase())) {
      response.redirect(post.routeUrl)
      return
    }

    await next()
  }
}