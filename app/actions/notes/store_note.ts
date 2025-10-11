import BaseAction from '#actions/base_action'
import User from '#models/user'
import { noteValidator } from '#validators/note'
import { HttpContext } from '@adonisjs/core/http'
import { Infer } from '@vinejs/vine/types'
import GetPostNotes from './get_post_notes.js'

type Validator = Infer<typeof noteValidator>

export default class StoreNote extends BaseAction {
  validator = noteValidator

  async asController({ view, session, auth }: HttpContext, data: Validator) {
    await this.handle(auth.user!, data)

    session.toast('success', 'Your note has been saved')

    const notes = await GetPostNotes.run(auth.user?.id, data.postId)

    return view.render('components/lesson/notes', {
      lessonId: data.postId,
      notes: notes,
    })
  }

  async handle(user: User, { atTimestamp, ...data }: Validator) {
    if (!atTimestamp) {
      delete data.seconds
    }

    return user.related('notes').create(data)
  }
}
