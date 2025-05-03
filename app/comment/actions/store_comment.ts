import { commentValidator } from '#comment/validators/comment'
import BaseAction from '#core/actions/base_action'
import SendCommentNotification from '#notification/actions/send_comment_notification'
import SendMentionNotification from '#notification/actions/send_mention_notification'
import User from '#user/models/user'
import { HttpContext } from '@adonisjs/core/http'
import db from '@adonisjs/lucid/services/db'
import { Infer } from '@vinejs/vine/types'

type Validator = Infer<typeof commentValidator>

export default class StoreComment extends BaseAction<[user: User, data: Validator]> {
  validator = commentValidator

  async asController({ request, response, session, auth }: HttpContext, data: Validator) {
    const comment = await this.handle(auth.user!, data)
    const referrer = request.header('referrer')

    session.flash('success', 'Thanks for your comment!')

    return referrer
      ? response.redirect(`${referrer}#comment${comment.id}`)
      : response.redirect().back()
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
