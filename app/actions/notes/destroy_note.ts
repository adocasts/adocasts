import BaseAction from '#actions/base_action'
import User from '#models/user'
import { HttpContext } from '@adonisjs/core/http'
import GetPostNotes from './get_post_notes.js'

export default class DestroyNote extends BaseAction {
  async asController({ view, response, params, session, auth, up }: HttpContext) {
    const note = await this.handle(auth.user!, params.id)

    session.toast('success', 'Your note has been updated')

    if (!note.postId || up.isPage) {
      return response.redirect().back()
    }

    const notes = await GetPostNotes.run(auth.user?.id, note.postId)

    return view.render('components/lesson/notes', {
      lessonId: note.postId,
      notes: notes,
    })
  }

  async handle(user: User, id: number) {
    const note = await user.related('notes').query().where({ id }).firstOrFail()

    await note.delete()

    return note
  }
}
