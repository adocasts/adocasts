import BaseAction from '#actions/base_action'
import User from '#models/user'
import { commentStoreValidator } from '#validators/comment'
import { HttpContext } from '@adonisjs/core/http'
import db from '@adonisjs/lucid/services/db'
import { Infer } from '@vinejs/vine/types'
import SendCommentNotification from '../notifications/send_comment_notification.js'
import SendMentionNotification from '../notifications/send_mention_notification.js'

type Validator = Infer<typeof commentStoreValidator>

export default class StoreComment extends BaseAction<[user: User, data: Validator]> {
  validator = commentStoreValidator

  async authorize({ bouncer }: HttpContext) {
    await bouncer.with('CommentPolicy').authorize('store')
  }

  async asController({ response, session, auth }: HttpContext, data: Validator) {
    await this.handle(auth.user!, data)

    session.flash('success', 'Thanks for your comment!')

    return response.redirect().back()
  }

  async handle(user: User, data: Validator) {
    return db.transaction(async (trx) => {
      user.useTransaction(trx)

      const comment = await user.related('comments').create(data)
      const notifiedUserIds = await SendCommentNotification.run(comment, user, trx)

      await SendMentionNotification.run({
        trx,
        user,
        record: comment,
        skipUserIds: notifiedUserIds,
      })

      return comment
    })
  }
}
