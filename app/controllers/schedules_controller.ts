import CalendarService from '#services/calendar_service'
import type { HttpContext } from '@adonisjs/core/http'
import { DateTime } from 'luxon'
import ScheduleService from '#services/schedule_service'
import { inject } from '@adonisjs/core'

@inject()
export default class SchedulesController {
  protected years = [2020, 2021, 2022, 2023, 2024, 2025, 2026, 2027, 2028, 2029, 2030]
  protected months = [1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12]

  constructor(protected scheduleService: ScheduleService) {}

  async index({ view, params, timezone }: HttpContext) {
    let { year, month } = params

    if (year && !this.years.includes(year)) year = DateTime.now().year
    if (month && !this.months.includes(month)) month = DateTime.now().month
    
    const calendar = CalendarService.getMonth(year, month, timezone)
    const posts = await this.scheduleService.getPosts(year, month)
    const series = await this.scheduleService.getSeries()

    return view.render('pages/schedules/index', { calendar, posts, series })
  }
}
