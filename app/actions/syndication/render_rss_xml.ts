import BaseAction from '#actions/base_action'
import Post from '#models/post'
import parser from '#services/parser_service'
import env from '#start/env'
import { HttpContext } from '@adonisjs/http-server'

export default class RenderRssXml extends BaseAction {
  async asController({ view, response }: HttpContext) {
    response.append('Content-Type', 'text/xml')

    // todo: cache
    const content = await Post.build().published().orderBy('publishAt', 'desc').limit(25)

    for (const post of content) {
      post.body = post.body && (await parser.normalizeUrls(post.body))
    }

    return view.render('rss/feed', {
      title: 'Adocasts - AdonisJS Screencasts & Lessons',
      description:
        'Recent content from Adocasts - Learn AdonisJS, NodeJS, JavaScript and more through in-depth lesson screencasts.',
      domain: env.get('APP_DOMAIN'),
      feed: env.get('APP_DOMAIN') + '/rss',
      content,
    })
  }
}
