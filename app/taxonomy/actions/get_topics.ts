import BaseTopicDto from '#taxonomy/dtos/base_topic'
import Taxonomy from '#taxonomy/models/taxonomy'

export default class GetTopics {
  static async fromCache() {
    const results = await this.fromDb()

    // TODO: cache

    return results
  }

  static async fromDb() {
    return Taxonomy.build().display().order().dto(BaseTopicDto)
  }
}
