import BaseAction from '#actions/base_action'
import Comment from '#models/comment'
import User from '#models/user'
import { commentUpdateValidator } from '#validators/comment'
import { HttpContext } from '@adonisjs/core/http'
import db from '@adonisjs/lucid/services/db'
import { Infer } from '@vinejs/vine/types'
import GetNewMentions from '../notifications/get_new_mentions.js'
import SendMentionNotification from '../notifications/send_mention_notification.js'

export default class UpdateComment extends BaseAction<[User, Comment, string]> {
  validator = commentUpdateValidator

  async asController(
    { response, params, bouncer, auth, session, request }: HttpContext,
    { body }: Infer<typeof this.validator>
  ) {
    const comment = await Comment.findOrFail(params.id)

    await bouncer.with('CommentPolicy').authorize('update', comment)

    await this.handle(auth.user!, comment, body)

    session.toast('success', 'Your comment has been updated')

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
