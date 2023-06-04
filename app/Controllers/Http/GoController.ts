import type { HttpContextContract } from '@ioc:Adonis/Core/HttpContext'
import Comment from 'App/Models/Comment'
import LessonRequest from 'App/Models/LessonRequest'
import Post from 'App/Models/Post'

export default class GoController {
  public async postComment({ response, params, session }: HttpContextContract) {
    const { id, commentId } = params
    const post = await Post.find(id)
    const comment = await Comment.find(commentId)

    if (!post || !comment) {
      session.flash('error', !post
        ? "The post associated with this comment could not be found & may have been deleted."
        : "The comment could not be found & may have been deleted.")

      return response.redirect().back()
    }

    if (!comment.isPublic) {
      return response.redirect(`/studio/comments#comment${commentId}`)
    }

    return response.redirect(`/lessons/${post.slug}#comment${commentId}`)
  }

  public async lessonRequestComment({ response, params, session }: HttpContextContract) {
    const { id, commentId } = params
    const lessonRequest = await LessonRequest.find(id)
    const comment = await Comment.find(commentId)

    if (!lessonRequest || !comment) {
      session.flash('error', !lessonRequest
        ? 'The request associated with this comment could not be found & may have been deleted'
        : 'The comment could not be found & may have been deleted')

      return response.redirect().back()
    }

    if (!comment.isPublic) {
      return response.redirect(`/studio/comments#comment${commentId}`)
    }

    return response.redirect(`/requests/lessons/${lessonRequest.id}#comment${commentId}`)
  }

  public async authReset({ response, session }: HttpContextContract) {
    session.flash('warning', 'Your session has expired')
    return response.redirect().back()
  }
}
