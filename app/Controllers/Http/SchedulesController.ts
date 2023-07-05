import { inject } from '@adonisjs/core/build/standalone'
import type { HttpContextContract } from '@ioc:Adonis/Core/HttpContext'
import NotionService from 'App/Services/NotionService'

@inject()
export default class SchedulesController {
  constructor(protected notionService: NotionService) {}

  public async index({ view }: HttpContextContract) {
    const schedule = await this.notionService.getContentSchedule()
    return view.render('pages/schedule/index', { schedule })
  }

  public async show({ view, params }: HttpContextContract) {
    const page = await this.notionService.getPage(params.id)
    const content = await this.notionService.getPageContent(params.id)

    return view.render('pages/schedule/show', { page, content })
  }
}
