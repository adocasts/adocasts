import CalendarService from '#services/calendar_service'
import notion from '#services/notion_service'
import type { HttpContext } from '@adonisjs/core/http'
import { DateTime } from 'luxon'

export default class SchedulesController {
  protected years = [2020, 2021, 2022, 2023, 2024, 2025, 2026, 2027, 2028, 2029, 2030]
  protected months = [1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12]

  public async index({ view, params }: HttpContext) {
    let { year, month } = params

    if (year && !this.years.includes(year)) year = DateTime.now().year
    if (month && !this.months.includes(month)) month = DateTime.now().month

    const calendar = CalendarService.getMonth(year, month)

    const data = await notion.getSchedule(year, month)
    return view.render('pages/schedules/index', { calendar, ...data })
  }
}