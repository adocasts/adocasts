import type { HttpContextContract } from '@ioc:Adonis/Core/HttpContext'

export default class Unpoly {
  public async handle({ up, session }: HttpContextContract, next: () => Promise<void>) {
    // code for middleware goes here. ABOVE THE NEXT CALL
    if (!up.isUnpolyRequest) {
      session.forget('videoPlayerId')
    }
    
    await next()
  }
}
