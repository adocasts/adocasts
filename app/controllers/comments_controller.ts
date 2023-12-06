import { commentValidator } from '#validators/comment_validator'
import type { HttpContext } from '@adonisjs/core/http'

export default class CommentsController {
  async store({ request, response }: HttpContext) {
    const data = await request.validateUsing(commentValidator)
    const referrer = request.header('referrer')

    const comment = await CommentService.store(request, auth, data)

    return referrer
      ? response.redirect(`${referrer}#comment${comment.id}`)
      : response.redirect().back()
  }

  async update({ params, request }: HttpContext) {}

  async like({ }: HttpContext) {}

  async destroy({ params }: HttpContext) {}
}