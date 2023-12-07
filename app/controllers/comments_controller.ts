import Comment from '#models/comment'
import CommentService from '#services/comment_service'
import { commentValidator } from '#validators/comment_validator'
import { inject } from '@adonisjs/core'
import type { HttpContext } from '@adonisjs/core/http'

@inject()
export default class CommentsController {
  constructor(protected commentService: CommentService) {}

  async store({ request, response }: HttpContext) {
    const data = await request.validateUsing(commentValidator)
    const referrer = request.header('referrer')

    const comment = await this.commentService.store(data)

    return referrer
      ? response.redirect(`${referrer}#comment${comment.id}`)
      : response.redirect().back()
  }

  async update({ request, response, params, bouncer }: HttpContext) {
    const { body } = request.only(['body'])
    const comment = await Comment.findOrFail(params.id)
    const referrer = request.header('referrer')

    await bouncer.with('CommentPolicy').authorize('update', comment)
    await this.commentService.update(comment, body)

    return referrer
      ? response.redirect(`${referrer}#comment${comment.id}`)
      : response.redirect().back()
  }

  async like({ response, params }: HttpContext) {
    await this.commentService.likeToggle(params.id)

    return response.redirect().back()
  }

  async destroy({ response, params, bouncer }: HttpContext) {
    const comment = await Comment.findOrFail(params.id)

    await bouncer.with('CommentPolicy').authorize('delete', comment)

    await this.commentService.destroy(comment)

    return response.redirect().back()
  }
}