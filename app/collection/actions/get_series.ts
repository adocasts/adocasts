import { SeriesShowDto } from '#collection/dtos/series_show'
import Collection from '#collection/models/collection'
import CacheableAction from '#core/actions/cacheable_action'
import SeriesLessonDto from '#post/dtos/series_lesson'
import TopicDto from '#taxonomy/dtos/topic'

export default class GetSeries extends CacheableAction<string, string> {
  async fromCache(slug: string) {
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
