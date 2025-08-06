import BaseAction from '#actions/base_action'
import { SeriesShowDto } from '#dtos/series_show'
import CacheNamespaces from '#enums/cache_namespaces'
import { ProgressContext } from '#middleware/context/_progress'
import Collection from '#models/collection'
import Watchlist from '#models/watchlist'
import cache from '@adonisjs/cache/services/main'
import SeriesLessonDto from '../../dtos/series_lesson.js'
import TopicDto from '../../dtos/topic.js'

export default class GetSeries extends BaseAction<[number | string, number | undefined]> {
  async handle(slug: string, userId?: number) {
    const series = await cache.namespace(CacheNamespaces.COLLECTIONS).getOrSet({
      key: `GET_SERIES_${slug}`,
      factory: () => this.fromDb(slug),
    })

    series.meta.isInWatchlist = await Watchlist.forCollection(userId, series.id)

    return series
  }

  async fromDb(slug: string) {
    return Collection.build()
      .series()
      .root()
      .publicOrPreview()
      .where({ slug })
      .withPosts((query) => query.selectDto(SeriesLessonDto))
      .withTaxonomies((query) => query.selectDto(TopicDto))
      .withChildren()
      .withPostCount()
      .withTotalMinutes()
      .firstOrFail(SeriesShowDto)
  }

  static flattenLessons(series: SeriesShowDto) {
    if (series.lessons.length) return series.lessons
    return series.modules.reduce<SeriesLessonDto[]>((flat, mod) => [...flat, ...mod.lessons], [])
  }

  static nextUserLesson(series: SeriesShowDto, progress: ProgressContext) {
    const lessons = this.flattenLessons(series)

    if (!lessons?.length) return

    for (const lesson of lessons) {
      const progression = progress.post.get(lesson.id)

      // if post is completed, skip
      if (progression?.isCompleted) continue

      return lesson
    }

    return lessons.at(0)
  }

  static nextLesson(series: SeriesShowDto, lessonId: number) {
    const lessons = this.flattenLessons(series)
    const lessonIndex = lessons.findIndex((post) => post.id === lessonId)
    const nextIndex = lessonIndex + 1

    return nextIndex > -1 ? lessons.at(nextIndex) : undefined
  }

  static prevLesson(series: SeriesShowDto, lessonId: number) {
    const lessons = this.flattenLessons(series)
    const lessonIndex = lessons.findIndex((post) => post.id === lessonId)
    const prevIndex = lessonIndex - 1

    return prevIndex > -1 ? lessons.at(prevIndex) : undefined
  }
}
