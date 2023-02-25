import type { HttpContextContract } from '@ioc:Adonis/Core/HttpContext'
import NotificationService from 'App/Services/NotificationService'

export default class UsersController {
  public async menu({ view, auth }: HttpContextContract) {
    const notifications = await NotificationService.getForUser(auth.user)
    return view.render('pages/users/menu', { notifications })
  }
}
