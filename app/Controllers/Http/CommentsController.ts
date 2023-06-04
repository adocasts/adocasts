import type { HttpContextContract } from '@ioc:Adonis/Core/HttpContext'
import Comment from 'App/Models/Comment'
import CommentService from 'App/Services/CommentService'
import CommentValidator from 'App/Validators/CommentValidator'

export default class CommentsController {
  public async store({ request, response, auth }: HttpContextContract) {
    const data = await request.validate(CommentValidator)
    const referrer = request.header('referrer')

    const comment = await CommentService.store(request, auth, data)

    return referrer
      ? response.redirect(`${referrer}#comment${comment.id}`)
      : response.redirect().back()
  }

  public async update({ request, response, params, bouncer }: HttpContextContract) {
    const data = request.only(['body'])
    const comment = await Comment.findOrFail(params.id)
    const referrer = request.header('referrer')

    await bouncer.with('CommentPolicy').authorize('update', comment)
    await CommentService.update(comment, data)

    return referrer
      ? response.redirect(`${referrer}#comment${comment.id}`)
      : response.redirect().back()
  }

  public async like({ params, response, auth }: HttpContextContract) {
    await CommentService.likeToggle(auth, params.id)

    return response.redirect().back()
  }

  public async destroy({ response, params, bouncer }: HttpContextContract) {
    const comment = await Comment.findOrFail(params.id)

    await bouncer.with('CommentPolicy').authorize('delete', comment)

    await CommentService.destroy(comment)

    return response.redirect().back()
  }
}
