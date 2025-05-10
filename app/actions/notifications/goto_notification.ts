import BaseAction from '#actions/base_action'
import { NotificationGoTargets } from '#enums/notification_gos'
import NotImplementedException from '#exceptions/not_implemented_exception'
import Comment from '#models/comment'
import LessonRequest from '#models/lesson_request'
import { notificationGoValidator } from '#validators/notification'
import { HttpContext } from '@adonisjs/core/http'
import { Infer } from '@vinejs/vine/types'

type Validator = Infer<typeof notificationGoValidator>
type Params = Validator['params']

export default class GoToNotification extends BaseAction {
  validator = notificationGoValidator

  async asController(ctx: HttpContext, { params }: Validator) {
    switch (params.target) {
      case NotificationGoTargets.COMMENT:
        return this.#goToComment(ctx, params)
      default:
        throw new NotImplementedException(
          `${this.constructor.name} does not implement ${params.target}`
        )
    }
  }

  async #goToComment({ response, session }: HttpContext, params: Params) {
    const comment = await Comment.find(params.targetId)
    const commentable = await comment?.getCommentable()

    if (!comment) {
      session.flash('error', 'The comment could not be found and may have been deleted.')
      return response.redirect().back()
    }

    if (!commentable) {
      session.flash(
        'error',
        'The content associated with the comment could not be found and may have been deleted.'
      )
      return response.redirect().back()
    }

    if (!comment.isPublic) {
      session.flash('error', 'The comment has not been made public and may be under review.')
      return response.redirect().back()
    }

    if (commentable instanceof LessonRequest) {
      session.flash('error', 'Lesson requests on Adocasts have been archived')
      return response.redirect().back()
    }

    return response.redirect(`${commentable.routeUrl}#comment${comment.id}`)
  }
}
