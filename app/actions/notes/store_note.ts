import BaseAction from '#actions/base_action'
import User from '#models/user'
import { noteStoreValidator } from '#validators/note'
import { HttpContext } from '@adonisjs/core/http'
import { Infer } from '@vinejs/vine/types'
import GetPostNotes from './get_post_notes.js'

type Validator = Infer<typeof noteStoreValidator>

export default class StoreNote extends BaseAction {
  validator = noteStoreValidator

  async asController({ view, response, session, auth, up }: HttpContext, data: Validator) {
    await this.handle(auth.user!, data)

    session.toast('success', 'Your note has been saved')

    if (up.isPage) {
      return response.redirect().back()
    }

    const notes = await GetPostNotes.run(auth.user?.id, data.postId)

    return view.render('components/lesson/notes', {
      lessonId: data.postId,
      notes: notes,
    })
  }

  async handle(user: User, { atTimestamp, ...data }: Validator) {
    if (!atTimestamp) {
      delete data.timestampSeconds
    }

    return user.related('notes').create(data)
  }
}
