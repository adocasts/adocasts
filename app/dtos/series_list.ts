import ProgressTypes from '#enums/progress_types'
import Collection from '#models/collection'
import AssetDto from './asset.js'
import FrameworkVersionDto from './framework_version.js'
import ProgressableDto from './progressable_dto.js'
import SeriesLessonDto from './series_lesson.js'
import TopicDto from './topic.js'

export default class SeriesListDto extends ProgressableDto {
  static model() {
    return Collection
  }

  progressType = ProgressTypes.COLLECTION

  declare id: number
  declare difficultyId: number | null
  declare name: string
  declare slug: string
  declare description: string
  declare asset: AssetDto | null
  declare topics: TopicDto[]
  declare lessons: SeriesLessonDto[]
  declare frameworkVersions: FrameworkVersionDto[]
  declare meta: Record<string, any>

  constructor(series?: Collection) {
    super()

    if (!series) return

    this.id = series.id
    this.difficultyId = series.difficultyId
    this.name = series.name
    this.slug = series.slug
    this.description = series.description
    this.asset = series.asset
    this.topics = TopicDto.fromArray(series.taxonomies)
    this.lessons = SeriesLessonDto.fromArray(series.postsFlattened)
    this.frameworkVersions = FrameworkVersionDto.fromArray(series.frameworkVersions)
    this.meta = series.$extras
  }
}
