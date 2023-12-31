import { DatabaseObjectResponse } from "@notionhq/client/build/src/api-endpoints.js";

export default class NotionSeriesVM {
  declare id: string
  declare name: string
  declare status: string
  declare difficulty: string

  constructor(record: DatabaseObjectResponse) {
    const properties: Record<string, any> = record.properties

    this.id = record.id
    this.name = properties['Name'].title[0].plain_text
    this.status = properties['Status'].status?.name
    this.difficulty = properties['Difficulty'].select?.name
  }
}