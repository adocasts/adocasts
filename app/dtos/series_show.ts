import ProgressableDto from '#dtos/progressable_dto'
import ProgressTypes from '#enums/progress_types'
import Collection from '#models/collection'
import AssetDto from './asset.js'
import ModuleDto from './module.js'
import SeriesLessonDto from './series_lesson.js'
import TopicDto from './topic.js'

export class SeriesShowDto extends ProgressableDto {
  static model() {
    return Collection
  }

  progressType = ProgressTypes.COLLECTION

  declare id: number
  declare statusId: number
  declare difficultyId: number | null
  declare name: string
  declare slug: string
  declare description: string
  declare asset: AssetDto | null
  declare topics: TopicDto[]
  declare lessons: SeriesLessonDto[]
  declare repositoryUrl?: string
  declare youtubePlaylistUrl?: string
  declare modules: ModuleDto[]
  declare meta: Record<string, any>

  get postIds() {
    if (!this.lessons && !this.modules) return []

    const modulePostIds = this.modules.reduce<number[]>(
      (acc, module) => [...acc, ...(module.lessons?.map((post) => post.id) || [])],
      []
    )
    const postIds = this.lessons?.map((post) => post.id) ?? []

    return [...modulePostIds, ...postIds]
  }

  constructor(series?: Collection) {
    super()

    if (!series) return

    this.id = series.id
    this.difficultyId = series.difficultyId
    this.statusId = series.statusId
    this.name = series.name
    this.slug = series.slug
    this.description = series.description
    this.asset = series.asset
    this.topics = TopicDto.fromArray(series.taxonomies)
    this.lessons = SeriesLessonDto.fromArray(series.postsFlattened)
    this.repositoryUrl = series.repositoryUrl
    this.youtubePlaylistUrl = series.youtubePlaylistUrl
    this.modules = ModuleDto.fromArray(series.children)
    this.lessons = SeriesLessonDto.fromArray(series.posts)
    this.meta = series.$extras
  }
}
