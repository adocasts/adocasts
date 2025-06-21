import BaseAction from '#actions/base_action'
import { discussionVoteValidator } from '#validators/discussion'
import User from '#models/user'
import { HttpContext } from '@adonisjs/http-server'
import GetDiscussion from './get_discussion.js'

export default class ToggleDiscussionVote extends BaseAction<[User, number]> {
  validator = discussionVoteValidator

  async asController({ view, params, auth, bouncer, up }: HttpContext) {
    await bouncer.with('DiscussionPolicy').authorize('vote')

    await this.handle(auth.user!, params.id)

    view.share({ isFragment: true })

    return view.render('components/frags/discussion/vote', {
      discussion: await GetDiscussion.run(params.id),
    })
  }

  async handle(user: User, discussionId: number) {
    const vote = await user
      .related('discussionVotes')
      .query()
      .where('discussions.id', discussionId)
      .first()

    return vote
      ? user.related('discussionVotes').detach([discussionId])
      : user.related('discussionVotes').attach([discussionId])
  }
}
