import type { HttpContext } from '@adonisjs/core/http'

export default class SignInController {
  /**
   * Display form to create a new record
   */
  async create({ view }: HttpContext) {
    return view.render('pages/auth/signin')
  }

  /**
   * Handle form submission for the create action
   */
  async store({ request }: HttpContext) {}
}