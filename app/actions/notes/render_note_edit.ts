import BaseAction from '#actions/base_action'
import { HttpContext } from '@adonisjs/core/http'

export default class RenderNoteEdit extends BaseAction {
  async asController({ view, params, auth }: HttpContext) {
    const note = await auth
      .user!.related('notes')
      .query()
      .preload('post')
      .where('id', params.id)
      .firstOrFail()

    return view.render('pages/notes/edit', { note })
  }
}
