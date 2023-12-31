import { DatabaseObjectResponse } from "@notionhq/client/build/src/api-endpoints.js";
import NotionTopicVM from "./notion_series.js";
import { DateTime } from "luxon";
import NotionSeriesVM from "./notion_series.js";
import NotionModuleVM from "./notion_module.js";

export default class NotionPostVM {
  declare id: string
  declare seriesId: string
  declare series?: NotionSeriesVM
  declare moduleId: string
  declare module?: NotionModuleVM
  declare title: string
  declare type: string
  declare status: string
  declare publishAt: DateTime | null

  constructor(record: DatabaseObjectResponse, series: NotionSeriesVM[], modules: NotionModuleVM[]) {
    const properties: Record<string, any> = record.properties

    this.id = record.id
    this.title = properties['Name'].title[0].plain_text
    this.seriesId = properties['Series'].relation.at(0)?.id
    this.series = series.find(item => item.id === this.seriesId)
    this.moduleId = properties['Modules'].relation.at(0)?.id
    this.module = modules.find(item => item.id === this.moduleId)
    this.status = properties['Status'].status?.name
    this.type = properties['Type'].select?.name

    if (properties['Publish'].date) {
      this.publishAt = DateTime.fromISO(properties['Publish'].date?.start)
    }
  }
}