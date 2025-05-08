import { SeriesShowDto } from '#enums/series_show'
import Collection from '#models/collection'
import SeriesLessonDto from '../../dtos/series_lesson.js'
import TopicDto from '../../dtos/topic.js'
import BaseAction from '#actions/base_action'

export default class GetSeries extends BaseAction<[string]> {
  async handle(slug: string) {
    const series = await this.fromDb(slug)

    // TODO: cache

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
}
