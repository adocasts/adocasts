import CacheableAction from '#core/actions/cacheable_action'
import BaseTopicDto from '#taxonomy/dtos/base_topic'
import Taxonomy from '#taxonomy/models/taxonomy'

export default class GetTopics extends CacheableAction {
  async fromCache() {
    const results = await this.fromDb()

    // TODO: cache

    return results
  }

  async fromDb() {
    return Taxonomy.build().display().order().dto(BaseTopicDto)
  }
}
