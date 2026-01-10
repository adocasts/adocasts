import BaseAction from '#actions/base_action'
import { HttpContext } from '@adonisjs/core/http'
import GetNotes from './get_notes.js'

export default class RenderNotesIndex extends BaseAction {
  async asController({ view, response, auth, params }: HttpContext) {
    const notes = await GetNotes.run(auth.user!)

    if (params.id) {
      const note = await auth
        .user!.related('notes')
        .query()
        .preload('post')
        .where('id', params.id)
        .first()

      if (!note) {
        return response.redirect().toRoute('notes.index')
      }

      view.share({ note })
    }

    return view.render('pages/users/notes', { notes })
  }
}
