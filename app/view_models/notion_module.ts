import { DatabaseObjectResponse } from '@notionhq/client/build/src/api-endpoints.js'

export default class NotionModuleVM {
  declare id: string
  declare name: string
  declare status: string
  declare seriesId: string

  constructor(record: DatabaseObjectResponse) {
    const properties: Record<string, any> = record.properties

    this.id = record.id
    this.name = properties['Name'].title[0].plain_text
    this.status = properties['Status'].status?.name
    this.seriesId = properties['Series'].relation.at(0)?.id
  }
}

