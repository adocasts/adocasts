import { HttpContextContract } from '@ioc:Adonis/Core/HttpContext'
const minify = require('html-minifier').minify;

export default class HtmlMinify {
  public async handle({ response, request }: HttpContextContract, next: () => Promise<void>) {
    // code for middleware goes here. ABOVE THE NEXT CALL
    await next()

    const method = request.method()
    const accepts = request.accepts([]) ?? [] as string[]
    if (method === 'GET' && accepts.includes('text/html')) {
      const minified = minify(response.getBody(), {
        minifyCss: true,
        minifyJs: true,
        removeComments: true,
        preserveLineBreaks: true,
        collapseInlineTagWhitespace: true,
        collapseWhitespace: true
      })

      response.send(minified)
    }
  }
}
