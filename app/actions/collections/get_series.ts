import { SeriesShowDto } from '#dtos/series_show'
import Collection from '#models/collection'
import SeriesLessonDto from '../../dtos/series_lesson.js'
import TopicDto from '../../dtos/topic.js'
import BaseAction from '#actions/base_action'
import Watchlist from '#models/watchlist'

export default class GetSeries extends BaseAction<[number | string, number | undefined]> {
  async handle(slug: string, userId?: number) {
    const series = await this.fromDb(slug)
    const isInWatchlist = await Watchlist.forCollection(userId, series.id)

    series.meta.isInWatchlist = isInWatchlist

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
