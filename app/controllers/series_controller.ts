import CollectionService from '#services/collection_service';
import { inject } from '@adonisjs/core';
import type { HttpContext } from '@adonisjs/core/http'

@inject()
export default class SeriesController {
  constructor(protected collectionService: CollectionService) {}

  public async index({ view }: HttpContext) {
    const features = await this.collectionService.getLastUpdated(8, true)
    const series = await this.collectionService.getList(true).orderBy('name')

    return view.render('pages/series/index', { features, series })
  }

  public async show({ view, params, route }: HttpContext) {
    const item = await this.collectionService.findBy('slug', params.slug)
    const nextLesson = await this.collectionService.findNextLesson(item)

    // await this.historyService.recordView(item, route?.name)

    return view.render('pages/series/show', { item, nextLesson })
  }
}