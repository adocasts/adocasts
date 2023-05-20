import type { HttpContextContract } from '@ioc:Adonis/Core/HttpContext'

export default class SessionsController {
  public async set({ request, response, session }: HttpContextContract) {
    const { target, value } = request.body()

    session.put(target, value)

    return response.status(204)
  }
}
