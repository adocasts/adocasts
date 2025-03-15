import TaxonomyBuilder from '#builders/taxonomy_builder'
import BaseTopicDto from '../../dtos/topics/base_topic.js'
import cache from '@adonisjs/cache/services/main'

export default class GetTopics {
  static async fromCache() {
    const results = await this.fromDb()

    // TODO: cache

    return results
  }

  static async fromDb() {
    return TaxonomyBuilder.new().display().order().dto(BaseTopicDto)
  }
}
