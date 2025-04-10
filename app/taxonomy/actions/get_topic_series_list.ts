import BaseSeriesDto from '#collection/dtos/base_series'
import Collection from '#collection/models/collection'
import CacheableAction from '#core/actions/cacheable_action'

export default class GetTopicSeriesList extends CacheableAction<string, string> {
  async fromCache(slug: string) {
    const series = await this.fromDb(slug).dto(BaseSeriesDto)

    // TODO cache

    return series
  }

  fromDb(slug: string) {
    return Collection.build()
      .series()
      .withPostCount()
      .withTotalMinutes()
      .whereHasTaxonomy(slug)
      .orderLatestUpdated()
  }
}
