import BaseAction from '#actions/base_action'
import { HttpContext } from '@adonisjs/core/http'
import GetNotes from './get_notes.js'

export default class RenderNotesIndex extends BaseAction {
  async asController({ view, auth }: HttpContext) {
    const notes = await GetNotes.run(auth.user!)

    return view.render('pages/users/notes', { notes })
  }
}
