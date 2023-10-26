import type { HttpContextContract } from '@ioc:Adonis/Core/HttpContext'

export default class Context {
  public async handle(ctx: HttpContextContract, next: () => Promise<void>) {
    if (ctx.request.url().startsWith('/img/')) {
      await next()
      return
    }

    const { timezone } = ctx.request.cookiesList()
    ctx.timezone = timezone
    ctx.view.share({ timezone })

    // code for middleware goes here. ABOVE THE NEXT CALL
    await next()
  }
}
