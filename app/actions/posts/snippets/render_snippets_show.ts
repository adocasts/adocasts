import BaseAction from '#actions/base_action'
import { HttpContext } from '@adonisjs/core/http'
import GetSnippet from './get_snippet.js'

export default class RenderSnippetsShow extends BaseAction {
  async asController({ view, params, auth }: HttpContext) {
    const snippet = await GetSnippet.run(params.slug, auth.user?.id)

    return view.render('pages/snippets/show', { snippet })
  }
}
