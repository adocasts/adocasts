import BaseAction from '#actions/base_action'
import { HttpContext } from '@adonisjs/core/http'
import GetBlog from './get_blog.js'

export default class RenderBlogsShow extends BaseAction {
  async asController({ view, params }: HttpContext) {
    const blog = await GetBlog.run(params.slug)

    return view.render('pages/blogs/show', { blog })
  }
}
