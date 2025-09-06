import BaseAction from '#actions/base_action'
import SendMentionNotification from '#actions/notifications/send_mention_notification'
import User from '#models/user'
import logger from '#services/logger_service'
import { discussionValidator } from '#validators/discussion'
import { HttpContext } from '@adonisjs/core/http'
import db from '@adonisjs/lucid/services/db'
import { Infer } from '@vinejs/vine/types'

type Validator = Infer<typeof discussionValidator>

export default class StoreDiscussion extends BaseAction {
  validator = discussionValidator

  async authorize({ bouncer }: HttpContext) {
    await bouncer.with('DiscussionPolicy').authorize('store')
  }

  async asController({ response, auth }: HttpContext, data: Validator) {
    const discussion = await this.handle(auth.user!, data)

    await logger.info('New discussion created', { title: discussion.title })

    return response.redirect().toRoute('discussions.show', { slug: discussion.slug })
  }

  async handle(user: User, data: Validator) {
    return db.transaction(async (trx) => {
      const record = await user.related('discussions').create(data, { client: trx })

      await SendMentionNotification.run({
        trx,
        user,
        record,
        skipUserIds: [user.id],
      })

      return record
    })
  }
}
