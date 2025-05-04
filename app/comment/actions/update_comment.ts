import { commentUpdateValidator } from '#comment/validators/comment'
import BaseAction from '#core/actions/base_action'
import User from '#user/models/user'
import Comment from '#comment/models/comment'
import { HttpContext } from '@adonisjs/core/http'
import { Infer } from '@vinejs/vine/types'
import db from '@adonisjs/lucid/services/db'
import GetNewMentions from '#notification/actions/get_new_mentions'
import SendMentionNotification from '#notification/actions/send_mention_notification'

export default class UpdateComment extends BaseAction<[User, Comment, string]> {
  validator = commentUpdateValidator

  async asController(
    { response, params, bouncer, auth, session }: HttpContext,
    { body }: Infer<typeof this.validator>
  ) {
    const comment = await Comment.findOrFail(params.id)

    await bouncer.with('CommentPolicy').authorize('update', comment)

    await this.handle(auth.user!, comment, body)

    session.flash('success', 'Your comment has been updated')

    return response.redirect().back()
  }

  async handle(user: User, record: Comment, body: string) {
    const bodyOld = record.body
    const mentions = GetNewMentions.run(bodyOld, body)

    return db.transaction(async (trx) => {
      record.useTransaction(trx)

      record.body = body

      await record.save()

      if (mentions.length) {
        await SendMentionNotification.run({ record, user, mentions, trx })
      }

      return record
    })
  }
}
