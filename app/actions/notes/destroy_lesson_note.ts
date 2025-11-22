import BaseAction from '#actions/base_action'
import { HttpContext } from '@adonisjs/core/http'
import DestroyNote from './destroy_note.js'
import GetPostNotes from './get_post_notes.js'

export default class DestroyLessonNote extends BaseAction {
  async asController({ view, params, session, auth }: HttpContext) {
    const note = await DestroyNote.run(auth.user!, params.id)

    session.toast('success', 'Your note has been deleted')

    const notes = await GetPostNotes.run(auth.user?.id, note.postId!)

    return view.render('components/lesson/notes', {
      lessonId: note.postId,
      notes: notes,
    })
  }
}
