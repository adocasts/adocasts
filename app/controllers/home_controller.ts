import CollectionService from '#services/collection_service'
import { inject } from '@adonisjs/core'
import type { HttpContext } from '@adonisjs/core/http'

@inject()
export default class HomeController {
  constructor(protected collectionService: CollectionService) {}

  /**
   * Display a list of resource
   */
  async index({ view }: HttpContext) {
    const series = await this.collectionService.getLastUpdated(7, true)

    return view.render('pages/home', { series })
  }
}