import Collection from '#collection/models/collection'
import CacheableAction from '#core/actions/cacheable_action'

export default class GetSeries extends CacheableAction<string, string> {
  async fromCache(slug: string) {
    const series = await this.fromDb(slug)

    // TODO: cache

    return series
  }

  async fromDb(slug: string) {
    return Collection.build().series().where({ slug }).display().firstOrFail()
  }
}
