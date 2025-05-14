import BaseAction from '#actions/base_action'
import { HttpContext } from '@adonisjs/core/http'
import GetSnippet from './get_snippet.js'

export default class RenderSnippetsShow extends BaseAction {
  async asController({ view, params }: HttpContext) {
    const snippet = await GetSnippet.run(params.slug)

    return view.render('pages/snippets/show', { snippet })
  }
}
