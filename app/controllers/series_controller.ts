import type { HttpContext } from '@adonisjs/core/http'

export default class SeriesController {
  async index({ inertia }: HttpContext) {
    return inertia.render('series/index', {})
  }

  async show({}: HttpContext) {}
}
