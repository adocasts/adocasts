import AssetDto from './asset.js'
import Collection from '#models/collection'
import ProgressableDto from '#dtos/progressable_dto'
import { ProgressContext } from '#middleware/context/_progress'
import SeriesLessonDto from './series_lesson.js'
import ProgressTypes from '#enums/progress_types'
import TopicDto from './topic.js'
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

  getFlatLessons() {
    if (this.lessons.length) return this.lessons

    return this.modules.reduce<SeriesLessonDto[]>((flat, mod) => [...flat, ...mod.lessons], [])
  }

  findNextUserLesson(progress: ProgressContext) {
    const lessons = this.getFlatLessons()
    if (!lessons?.length) return

    for (const lesson of lessons) {
      const progression = progress.post.get(lesson.id)

      // if post is completed, skip
      if (progression?.isCompleted) continue

      return lesson
    }

    return lessons.at(0)
  }

  findNextLesson(lessonId: number) {
    const lessons = this.getFlatLessons()
    const lessonIndex = lessons.findIndex((post) => post.id === lessonId)
    const nextIndex = lessonIndex + 1

    return nextIndex > -1 ? lessons.at(nextIndex) : undefined
  }

  findPrevLesson(lessonId: number) {
    const lessons = this.getFlatLessons()
    const lessonIndex = lessons.findIndex((post) => post.id === lessonId)
    const prevIndex = lessonIndex - 1

    return prevIndex > -1 ? lessons.at(prevIndex) : undefined
  }
}
