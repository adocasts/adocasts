import BaseAction from '#actions/base_action'
import CommentVote from '#models/comment_vote'
import Discussion from '#models/discussion'
import { HttpContext } from '@adonisjs/http-server'
import db from '@adonisjs/lucid/services/db'

export default class DestroyDiscussion extends BaseAction {
  async authorize({ bouncer, params }: HttpContext) {
    const discussion = await Discussion.findByOrFail('slug', params.slug)

    await bouncer.with('DiscussionPolicy').authorize('delete', discussion)

    return discussion
  }

  async asController({ response }: HttpContext, _: any, discussion: Discussion) {
    await this.handle(discussion)

    return response.redirect().toRoute('discussions.index')
  }

  async handle(record: Discussion) {
    return db.transaction(async (trx) => {
      record.useTransaction(trx)

      // clear out any solved comment so it can be deleted
      if (record.solvedCommentId) {
        record.solvedCommentId = null
        await record.save()
      }

      // delete discussion comments
      const comments = await record.related('comments').query()
      const commentIds = comments.map((comment) => comment.id)
      await CommentVote.query({ client: trx }).whereIn('commentId', commentIds).delete()

      // delete discussion
      await record.related('views').query().delete()
      await record.related('votes').query().delete()
      await record.related('comments').query().delete()
      await record.delete()
    })
  }
}
