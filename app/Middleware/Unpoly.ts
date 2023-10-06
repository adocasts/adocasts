import type { HttpContextContract } from '@ioc:Adonis/Core/HttpContext'

export default class Unpoly {
  public async handle({ request, up, session }: HttpContextContract, next: () => Promise<void>) {
    if (!up.isUnpolyRequest || !request.cookiesList().playingId) {
      session.forget('videoPlayerId')
    }

    await next()
  }
}
