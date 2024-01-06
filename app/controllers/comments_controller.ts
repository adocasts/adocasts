import Comment from '#models/comment'
import CommentService from '#services/comment_service'
import { commentValidator } from '#validators/comment_validator'
import { inject } from '@adonisjs/core'
import type { HttpContext } from '@adonisjs/core/http'

@inject()
export default class CommentsController {
  constructor(protected commentService: CommentService) {}

  async store({ request, response, up, session }: HttpContext) {
    const data = await request.validateUsing(commentValidator)
    const referrer = request.header('referrer')
    const comment = await this.commentService.store(data)

    if (referrer) {
      up.setLocation(`${referrer}#comment${comment.id}`)
    }

    session.flash('success', 'Thanks for your comment!')

    return referrer
      ? response.redirect(`${referrer}#comment${comment.id}`)
      : response.redirect().back()
  }

  async update({ request, response, params, bouncer, up, session }: HttpContext) {
    const { body } = request.only(['body'])
    const comment = await Comment.findOrFail(params.id)
    const referrer = request.header('referrer')

    await bouncer.with('CommentPolicy').authorize('update', comment)
    await this.commentService.update(comment, body)

    if (referrer) {
      up.setLocation(`${referrer.split('#')[0]}#comment${comment.id}`)
    }

    session.flash('success', 'Your comment has been updated')

    return referrer
      ? response.redirect(`${referrer.split('#')[0]}#comment${comment.id}`)
      : response.redirect().back()
  }

  async like({ view, params }: HttpContext) {
    await this.commentService.likeToggle(params.id)

    const comment = await Comment.findOrFail(params.id)

    await comment.load('user')
    await comment.load('userVotes', (query) => query.select('id'))

    return view.render('components/comments/like', { comment })
  }

  async destroy({ response, params, bouncer, session }: HttpContext) {
    const comment = await Comment.findOrFail(params.id)

    await bouncer.with('CommentPolicy').authorize('delete', comment)

    await this.commentService.destroy(comment)

    session.flash('success', 'Your comment has been deleted')

    return response.redirect().back()
  }
}
