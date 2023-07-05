import { Client } from '@notionhq/client'
import Env from '@ioc:Adonis/Core/Env'
import CacheService from './CacheService'
import { NotionToMarkdown } from 'notion-to-md'
import MarkdownIt from 'markdown-it'

export default class NotionService {
  private _client: Client

  constructor() {
    this._client = new Client({ auth: Env.get('NOTION_SECRET') })
  }

  public async getContentSchedule() {
    return CacheService.try('NOTION_SCHEDULE', async () => {
      return this._client.databases.query({
        database_id: 'cc16b7c9f2e745bd81c7041a58f8867f',
        sorts: [{ property: 'Date', direction: 'ascending' }]
      })
    }, CacheService.oneDay, true)
  }

  public async getPage(page_id: string) {
    return CacheService.try(`NOTION_PAGE_${page_id}`, async () => {
      return this._client.pages.retrieve({ page_id })
    }, CacheService.oneDay, true)
  }

  public async getPageContent(pageId: string) {
    return CacheService.try(`NOTION_PAGE_CONTENT_${pageId}`, async () => {
      const n2m = new NotionToMarkdown({ notionClient: this._client })
      const md = new MarkdownIt()
      const [block1, block2, block3, block4, block5] = await n2m.pageToMarkdown(pageId)
      const displayBlocks = [block1, block2, block3, block4, block5].filter(Boolean)
      
      if (!displayBlocks.length) return
      
      const mdString = await n2m.toMarkdownString(displayBlocks)
      
      if (!mdString?.parent) return
      
      return md.render(mdString.parent)
    }, CacheService.oneDay, true)
  }
}