import type { HttpContext } from '@adonisjs/core/http'

export default class SignUpController {
  /**
   * Display form to create a new record
   */
  async create({ view }: HttpContext) {
    return view.render('pages/auth/signup')
  }

  /**
   * Handle form submission for the create action
   */
  async store({ request }: HttpContext) {}
}