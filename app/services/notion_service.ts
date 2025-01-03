import { Client } from '@notionhq/client'
import env from '#start/env'
import { DateTime } from 'luxon'
import { DatabaseObjectResponse } from '@notionhq/client/build/src/api-endpoints.js'
import CacheService from './cache_service.js'
import NotionSeriesVM from '../view_models/notion_series.js'
import NotionModuleVM from '../view_models/notion_module.js'
import NotionPostVM from '../view_models/notion_post.js'

class NotionService {
  private declare client: Client

  constructor() {
    this.client = new Client({ auth: env.get('NOTION_SECRET') })
  }

  async getSchedule(year: number = DateTime.now().year, month: number = DateTime.now().month) {
    const modules = await this.getModules()
    const series = await this.getSeries(modules)
    const posts = await this.getPosts(series, modules, year, month)

    series.map((item) => (item.posts = posts.filter((post) => post.seriesId === item.id)))

    return { posts, modules, series }
  }

  async getSeries(modules: NotionModuleVM[] = []): Promise<NotionSeriesVM[]> {
    return CacheService.try(
      'NOTION_SERIES',
      async () => {
        const series = await this.client.databases.query({
          database_id: env.get('NOTION_DB_SERIES'),
          sorts: [
            { property: 'Status', direction: 'descending' },
            { property: 'Name', direction: 'ascending' },
          ],
          filter: {
            property: 'Status',
            status: {
              does_not_equal: 'Done',
            },
          },
        })

        return series.results.map(
          (item) => new NotionSeriesVM(item as DatabaseObjectResponse, modules)
        )
      },
      CacheService.oneDay
    )
  }

  async getModules(): Promise<NotionModuleVM[]> {
    return CacheService.try(
      'NOTION_MODULES',
      async () => {
        const modules = await this.client.databases.query({
          database_id: env.get('NOTION_DB_MODULES'),
          sorts: [{ property: 'Name', direction: 'ascending' }],
        })

        return modules.results.map((item) => new NotionModuleVM(item as DatabaseObjectResponse))
      },
      CacheService.oneDay
    )
  }

  async getPosts(
    series: NotionSeriesVM[],
    modules: NotionModuleVM[],
    year: number,
    month: number
  ): Promise<NotionPostVM[]> {
    const posts = await CacheService.try(
      `NOTION_POSTS_${year}_${month}`,
      async () => {
        const dte = DateTime.fromObject({ year, month })
        const items = await this.client.databases.query({
          database_id: env.get('NOTION_DB_POSTS'),
          sorts: [{ property: 'Name', direction: 'ascending' }],
          filter: {
            and: [
              {
                property: 'Publish',
                date: { on_or_after: dte.startOf('month').toISODate()! },
              },
              {
                property: 'Publish',
                date: { on_or_before: dte.endOf('month').toISODate()! },
              },
            ],
          },
        })

        return items.results.map(
          (item) => new NotionPostVM(item as DatabaseObjectResponse, series, modules)
        )
      },
      CacheService.oneDay
    )

    return posts.map((post: NotionPostVM) => ({
      ...post,
      publishAt:
        typeof post.publishAt === 'string' ? DateTime.fromISO(post.publishAt) : post.publishAt,
    }))
  }
}

const notion = new NotionService()
export default notion
