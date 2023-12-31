import { DatabaseObjectResponse } from "@notionhq/client/build/src/api-endpoints.js";
import NotionModuleVM from "./notion_module.js";
import NotionPostVM from "./notion_post.js";

export default class NotionSeriesVM {
  declare id: string
  declare name: string
  declare status: string
  declare difficulty: string
  declare modules: NotionModuleVM[]
  declare posts: NotionPostVM[]

  constructor(record: DatabaseObjectResponse, modules: NotionModuleVM[] = []) {
    const properties: Record<string, any> = record.properties

    this.id = record.id
    this.name = properties['Name'].title[0].plain_text
    this.status = properties['Status'].status?.name
    this.difficulty = properties['Difficulty'].select?.name
    this.modules = modules.filter(module => module.seriesId === this.id)
  }
}