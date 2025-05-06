import AssetDto from '#asset/dtos/asset'
import Collection from '#collection/models/collection'
import ProgressableDto from '#core/dtos/progressable_dto'
import { ProgressContext } from '#core/middleware/context/_progress'
import SeriesLessonDto from '#post/dtos/series_lesson'
import ProgressTypes from '#progress/enums/progress_types'
import TopicDto from '#taxonomy/dtos/topic'
import ModuleDto from './module.js'

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

  findNextUserLesson(progress: ProgressContext) {
    if (!this.postIds?.length) return

    for (const id of this.postIds) {
      const progression = progress.post.get(id)

      // if post is completed, skip
      if (progression?.isCompleted) continue

      // find post within series
      let lesson = this.lessons.find((post) => post.id === id)

      // if post is found, return it
      if (lesson) return lesson

      // find post within modules
      for (const module of this.modules) {
        lesson = module.lessons.find((post) => post.id === id)
        if (lesson) return lesson
      }
    }

    return this.lessons?.at(0) ?? this.modules?.at(0)?.lessons?.at(0)
  }
}
