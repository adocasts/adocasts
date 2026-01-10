import BaseAction from '#actions/base_action'
import Discussion from '#models/discussion'
import { discussionSolvedValidator } from '#validators/discussion'
import { HttpContext } from '@adonisjs/http-server'
import { Infer } from '@vinejs/vine/types'
import { DateTime } from 'luxon'

export default class ToggleDiscussionSolvedAt extends BaseAction {
  validator = discussionSolvedValidator

  async authorize({ bouncer, params }: HttpContext) {
    const discussion = await Discussion.findByOrFail('slug', params.slug)

    await bouncer.with('DiscussionPolicy').authorize('update', discussion)

    return discussion
  }

  async asController(
    { response, session }: HttpContext,
    { commentId }: Infer<typeof this.validator>,
    discussion: Discussion
  ) {
    await this.handle(discussion, commentId)

    session.flash(
      'success',
      discussion.solvedAt
        ? 'Your discussion has been marked as solved'
        : 'Your discussion has been marked as unsolved'
    )

    return response.redirect().back()
  }

  async handle(discussion: Discussion, solvedCommentId: number) {
    const isSolving = !discussion.solvedAt

    discussion.solvedAt = isSolving ? DateTime.now() : null
    discussion.solvedCommentId = isSolving ? solvedCommentId : null

    await discussion.save()

    return discussion
  }
}
