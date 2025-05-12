import BaseAction from '#actions/base_action'
import GetNewMentions from '#actions/notifications/get_new_mentions'
import SendMentionNotification from '#actions/notifications/send_mention_notification'
import Discussion from '#models/discussion'
import User from '#models/user'
import { discussionValidator } from '#validators/discussion'
import { HttpContext } from '@adonisjs/core/http'
import db from '@adonisjs/lucid/services/db'
import { Infer } from '@vinejs/vine/types'

type Validator = Infer<typeof discussionValidator>

export default class UpdateDiscussion extends BaseAction<[User, Discussion, Validator]> {
  validator = discussionValidator

  async authorize({ bouncer, params }: HttpContext) {
    const discussion = await Discussion.findByOrFail('slug', params.slug)

    await bouncer.with('DiscussionPolicy').authorize('update', discussion)

    return discussion
  }

  async asController({ response, auth }: HttpContext, data: Validator, discussion: Discussion) {
    await this.handle(auth.user!, discussion, data)

    return response.redirect().toRoute('discussions.show', { slug: discussion.slug })
  }

  async handle(user: User, record: Discussion, data: Validator) {
    const bodyOld = record.body
    const mentions = GetNewMentions.run(bodyOld, data.body)

    return db.transaction(async (trx) => {
      record.useTransaction(trx)
      record.merge(data)

      await record.save()

      if (mentions.length) {
        await SendMentionNotification.run({ record, user, mentions, trx })
      }

      return record
    })
  }
}
