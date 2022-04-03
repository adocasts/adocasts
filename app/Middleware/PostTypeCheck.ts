import { HttpContextContract } from '@ioc:Adonis/Core/HttpContext'
import { inject } from '@adonisjs/fold'
import RedirectService from 'App/Services/Http/RedirectService'
import Post from 'App/Models/Post'

@inject([RedirectService])
export default class PostTypeCheck {
  constructor(protected redirectService: RedirectService) {}

  public async handle({ params }: HttpContextContract, next: () => Promise<void>) {
    // code for middleware goes here. ABOVE THE NEXT CALL
    const post = await Post.findByOrFail('slug', params.slug)

    if (!this.redirectService.checkPostTypeUrl(post)) return

    await next()
  }
}
