import { HttpContextContract } from '@ioc:Adonis/Core/HttpContext'
import Comment from 'App/Models/Comment'
import Post from 'App/Models/Post'

export default class GoController {
  public async comment({ response, params, session }: HttpContextContract) {
    const { postId, commentId } = params
    const post = await Post.find(postId)
    const comment = await Comment.find(commentId)

    if (!post || !comment) {
      session.flash('error', !post
        ? "Post associated with comment could not be found & may have been deleted."
        : "Comment could not be found & may have been deleted.")

      return response.redirect().back()
    }

    if (!comment.isPublic) {
      return response.redirect(`/studio/comments#comment${commentId}`)
    }

    return response.redirect(`/lessons/${post.slug}#comment${commentId}`)
  }
}
