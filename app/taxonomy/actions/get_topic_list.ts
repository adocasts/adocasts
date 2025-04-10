import CacheableAction from '#core/actions/cacheable_action'
import BaseTopicDto from '#taxonomy/dtos/base_topic'
import Taxonomy from '#taxonomy/models/taxonomy'

export default class GetTopicList extends CacheableAction {
  async fromCache() {
    const results = await this.fromDb()

    // TODO: cache

    return results
  }

  async fromDb() {
    return GetTopicList.fromBuilder().dto(BaseTopicDto)
  }

  static fromBuilder() {
    return Taxonomy.build().display().order()
  }
}
