import { HttpContext } from '@adonisjs/core/http'
import { inject } from '@adonisjs/core'
import { DateTime } from 'luxon'
import Post from '#models/post'
import plotMyCourseService from '#services/plotmycourse_service'
import SchedulePostVM from '../view_models/schedule_post.js'
import ScheduleSeriesVM from '../view_models/schedule_series.js'
import bento from './bento_service.js'
import CacheNamespaces from '#enums/cache_namespaces'

export interface ScheduleDateRange {
  start: DateTime
  end: DateTime
}

@inject()
export default class ScheduleService {
  constructor(protected ctx: HttpContext) {}

  get cache() {
    return bento.namespace(CacheNamespaces.SCHEDULE)
  }

  async getSeries() {
    return this.cache.getOrSet(
      'SERIES',
      async () => {
        const series = await plotMyCourseService.getSeries()
        const active = series.filter((item: any) => item.statusId !== 43)
        const ideas = series.filter((item: any) => item.statusId === 43)

        return {
          active: active.map((item: any) => new ScheduleSeriesVM(item)),
          ideas: ideas.map((item: any) => new ScheduleSeriesVM(item)),
        }
      },
      { ttl: '30m' }
    )
  }

  async getPosts(year: number, month: number) {
    return this.cache.getOrSet(
      `POSTS_${year}_${month}`,
      async () => {
        const ranges = this.#getRanges(year, month)
        const dbPosts = await this.#getPostsFromDb(ranges.db)
        const apiPosts = await plotMyCourseService.getPosts(ranges.api)

        const dbPostVMs = dbPosts.map((post) => new SchedulePostVM(post))
        const apiPostVMs = apiPosts.map((post: any) => new SchedulePostVM(post))

        return dbPostVMs.concat(apiPostVMs)
      },
      { ttl: '30m' }
    )
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
