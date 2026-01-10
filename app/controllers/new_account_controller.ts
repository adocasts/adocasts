import User from '#models/user'
import { signUpValidator } from '#validators/auth'
import type { HttpContext } from '@adonisjs/core/http'

export default class NewAccountController {
  async create({ inertia }: HttpContext) {
    return inertia.render('auth/signup', {})
  }

  async store({ request, response, auth }: HttpContext) {
    const payload = await request.validateUsing(signUpValidator)
    const user = await User.create({ ...payload })

    await auth.use('web').login(user)
    response.redirect().toRoute('home')
  }
}
