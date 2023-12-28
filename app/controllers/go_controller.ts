import Comment from '#models/comment'
import Discussion from '#models/discussion'
import LessonRequest from '#models/lesson_request'
import Post from '#models/post'
import type { HttpContext } from '@adonisjs/core/http'

export default class GoController {
  public async postComment({ response, params, session }: HttpContext) {
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
      return response.redirect(`https://studio.adocasts.com/comments#comment${commentId}`)
    }

    return response.redirect(`${post.routeUrl}#comment${commentId}`)
  }

  public async lessonRequestComment({ response, params, session }: HttpContext) {
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
      return response.redirect(`https://studio.adocasts.com/comments#comment${commentId}`)
    }

    return response.redirect(`/requests/lessons/${lessonRequest.id}#comment${commentId}`)
  }

  public async discussionComment({ response, params, session }: HttpContext) {
    const { id, commentId } = params
    const discussion = await Discussion.find(id)
    const comment = await Comment.find(commentId)

    if (!discussion || !comment) {
      session.flash('error', !discussion
        ? "The discussion associated with this comment could not be found & may have been deleted."
        : "The comment could not be found & may have been deleted.")

      return response.redirect().back()
    }

    if (!comment.isPublic) {
      return response.redirect(`https://studio.adocasts.com/comments#comment${commentId}`)
    }

    return response.redirect(`/feed/${discussion.slug}#comment${commentId}`)
  }

  public async authReset({ response, session }: HttpContext) {
    session.flash('warning', 'Your session has expired')
    return response.redirect().back()
  }
}