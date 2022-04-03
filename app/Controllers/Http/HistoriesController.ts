import { HttpContextContract } from '@ioc:Adonis/Core/HttpContext'
import { inject } from '@adonisjs/fold'
import HistoryService from 'App/Services/Http/HistoryService'

@inject([HistoryService])
export default class HistoriesController {
  constructor(protected historyService: HistoryService) {}

  public async view({ response }: HttpContextContract) {
    const view = await this.historyService.recordView()

    return response.json({ success: true, view })
  }

  public async progression({ response }: HttpContextContract) {
    const progression = await this.historyService.recordProgression()

    return response.json({ success: true, progression })
  }

  public async progressionToggle({ response }: HttpContextContract) {
    const progression = await this.historyService.toggleCompleted()

    return response.json({ success: true, progression })
  }
}
