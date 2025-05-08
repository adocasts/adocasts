import Comment from '#models/comment'
import BaseAction from '#actions/base_action'
import States from '#enums/states'
import DestroyNotification from '../notifications/destroy_notification.js'
import { HttpContext } from '@adonisjs/core/http'
import db from '@adonisjs/lucid/services/db'
import { TransactionClientContract } from '@adonisjs/lucid/types/database'

export default class DestroyComment extends BaseAction<[Comment]> {
  async asController({ response, params, bouncer, session }: HttpContext) {
    const comment = await Comment.findOrFail(params.id)

    await bouncer.with('CommentPolicy').authorize('delete', comment)

    await this.handle(comment)

    session.flash('success', 'Your comment has been deleted')

    return response.redirect().back()
  }

  async handle(comment: Comment) {
    return db.transaction(async (trx) => {
      comment.useTransaction(trx)

      await this.#deleteOrArchive(comment, trx)
    })
  }

  async #deleteOrArchive(comment: Comment, trx: TransactionClientContract) {
    const childCount = await this.#getChildCount(comment)

    if (childCount) {
      return comment.archive()
    }

    await comment.related('userVotes').query().delete()
    await comment.delete()
    await DestroyNotification.run(Comment.table, comment.id, trx)
    await this.#cleanDanglingParent(comment, trx)
  }

  async #cleanDanglingParent(comment: Comment, trx: TransactionClientContract) {
    if (!comment.replyTo) return

    const parent = await Comment.find(comment.replyTo)

    if (parent?.stateId !== States.ARCHIVED) {
      return
    }

    return this.#deleteOrArchive(parent, trx)
  }

  async #getChildCount(comment: Comment) {
    const count = await comment
      .related('responses')
      .query()
      .whereNot('stateId', States.ARCHIVED)
      .getCount()

    return Number(count)
  }
}
