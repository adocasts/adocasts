import { HttpContextContract } from '@ioc:Adonis/Core/HttpContext'
const minify = require('html-minifier').minify;

export default class HtmlMinify {
  public async handle({ response, request }: HttpContextContract, next: () => Promise<void>) {
    // code for middleware goes here. ABOVE THE NEXT CALL
    await next()

    const method = request.method()
    const accepts = request.accepts([]) ?? [] as string[]
    const isXML = request.url().endsWith('.xml') || request.url().endsWith('/rss')
    const isImg = request.url().includes('/img/')
    if (method === 'GET' && accepts.includes('text/html') && !isXML && !isImg) {
      const minified = minify(response.getBody(), {
        minifyCss: true,
        minifyJs: true,
        removeComments: true,
        preserveLineBreaks: true,
        collapseInlineTagWhitespace: false,
        collapseWhitespace: true
      })

      response.send(minified)
    }
  }
}
