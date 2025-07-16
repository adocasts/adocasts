import BaseAction from '#actions/base_action'
import SchedulePostDto from '#dtos/schedule_post'
import Post from '#models/post'
import CalendarService from '#services/calendar_service'
import plotMyCourseService from '#services/plotmycourse_service'
import cache from '@adonisjs/cache/services/main'
import { HttpContext } from '@adonisjs/core/http'
import { DateTime } from 'luxon'

export interface ScheduleDateRange {
  start: DateTime
  end: DateTime
}

export default class RenderSchedule extends BaseAction {
  protected years = [2020, 2021, 2022, 2023, 2024, 2025, 2026, 2027, 2028, 2029, 2030]
  protected months = [1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12]

  async asController({ view, params, timezone }: HttpContext) {
    let { year, month } = params

    if (year && !this.years.includes(year)) year = DateTime.now().year
    if (month && !this.months.includes(month)) month = DateTime.now().month

    const calendar = CalendarService.getMonth(year, month, timezone)
    const posts = await this.#getPosts(year, month)

    return view.render('pages/schedules/index', { calendar, posts })
  }

  async #getPosts(year: number, month: number) {
    return cache.getOrSet({
      key: `POSTS_${year}_${month}`,
      ttl: '30m',
      factory: async () => {
        const ranges = this.#getRanges(year, month)
        const dbPosts = await this.#getPostsFromDb(ranges.db)
        const apiPosts = await plotMyCourseService.getPosts(ranges.api)

        const dbPostVMs = dbPosts.map((post) => new SchedulePostDto(post))
        const apiPostVMs = apiPosts.map((post: any) => new SchedulePostDto(post))

        return dbPostVMs.concat(apiPostVMs)
      },
    })
  }

  async #getPostsFromDb(range: ScheduleDateRange | null) {
    if (!range) return []

    return Post.query()
      .apply((scope) => scope.published())
      .whereBetween('publishAt', [range.start.toSQL()!, range.end.toSQL()!])
  }

  #getRanges(year: number, month: number) {
    const dtm = DateTime.fromObject({ year, month })
    const diff = dtm.diffNow('month')
    const range = {
      start: dtm.startOf('month'),
      end: dtm.endOf('month'),
    }

    if (diff.months >= 0) return { db: null, api: range }
    if (diff.months <= -1) return { db: range, api: null }

    const eod = DateTime.now().endOf('day')

    return {
      db: { ...range, end: eod },
      api: { ...range, start: eod },
    }
  }
}
