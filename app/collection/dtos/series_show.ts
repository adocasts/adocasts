import Collection from '#collection/models/collection'
import SeriesLessonDto from '#post/dtos/series_lesson'
import BaseSeriesDto from './base_series.js'
import ModuleDto from './module.js'

export class SeriesShowDto extends BaseSeriesDto {
  declare statusId: number
  declare repositoryUrl?: string
  declare youtubePlaylistUrl?: string
  declare modules: ModuleDto[]

  constructor(series?: Collection) {
    super(series)

    if (!series) return

    this.statusId = series.statusId || 0
    this.repositoryUrl = series.repositoryUrl
    this.youtubePlaylistUrl = series.youtubePlaylistUrl
    this.modules = ModuleDto.fromArray(series.children)
    this.lessons = SeriesLessonDto.fromArray(series.posts)
  }
}
