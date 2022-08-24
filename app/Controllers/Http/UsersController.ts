import type { HttpContextContract } from '@ioc:Adonis/Core/HttpContext'
import Themes from 'App/Enums/Themes'

export default class UsersController {
  public async theme({ response, auth, session, params }: HttpContextContract) {
    const { theme } = params

    if (Object.values(Themes).includes(theme)) {
      auth.user?.merge({ theme })
      await auth.user?.save()
      session.put('theme', theme)
    }

    return response.status(204)
  }
}
