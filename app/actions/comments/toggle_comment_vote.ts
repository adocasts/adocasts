import CommentDto from '../../dtos/comment.js'
import Comment from '#models/comment'
import BaseAction from '#actions/base_action'
import User from '#models/user'
import { HttpContext } from '@adonisjs/http-server'

export default class ToggleCommentVote extends BaseAction<[User, number]> {
  async asController({ view, params, auth, bouncer }: HttpContext) {
    const comment = await Comment.findOrFail(params.id)

    await bouncer.with('CommentPolicy').authorize('vote')

    await this.handle(auth.user!, params.id)

    await comment.load('userVotes', (query) => query.select('id'))

    return view.render('components/frags/comment/vote', {
      comment: CommentDto.fromModel(comment),
    })
  }

  async handle(user: User, commentId: number) {
    const vote = await user.related('commentVotes').query().where('comments.id', commentId).first()

    return vote
      ? user.related('commentVotes').detach([commentId])
      : user.related('commentVotes').attach([commentId])
  }
}
