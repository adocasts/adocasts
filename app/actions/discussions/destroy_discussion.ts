import BaseAction from '#actions/base_action'
import Discussion from '#models/discussion'
import { HttpContext } from '@adonisjs/http-server'

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
    await record.related('views').query().delete()
    await record.related('votes').query().delete()
    await record.delete()
  }
}
