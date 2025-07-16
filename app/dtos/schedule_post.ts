import { PostTypeDesc } from '#enums/post_types'
import { StateDesc } from '#enums/states'
import Post from '#models/post'
import { BaseDto } from '@adocasts.com/dto/base'
import { DateTime } from 'luxon'

export default class SchedulePostDto extends BaseDto {
  declare id: number
  declare title: string
  declare type: string
  declare status: string
  declare publishAt: DateTime | null
  declare url: string | null

  constructor(record: Post | any) {
    super()

    if (record instanceof Post) {
      this.id = record.id
      this.title = record.title
      this.type = PostTypeDesc[record.postTypeId]
      this.status = StateDesc[record.stateId]
      this.publishAt = record.publishAt
      this.url = record.routeUrl

      return
    }

    this.id = record.id
    this.title = record.name
    this.type = record.lessonType?.name
    this.status = record.status?.name
    this.publishAt = record.publishAt && DateTime.fromISO(record.publishAt)
  }
}
