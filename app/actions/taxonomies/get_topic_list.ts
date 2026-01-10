import BaseAction from '#actions/base_action'
import CacheNamespaces from '#enums/cache_namespaces'
import Taxonomy from '#models/taxonomy'
import cache from '@adonisjs/cache/services/main'
import TopicDto from '../../dtos/topic.js'

export default class GetTopicList extends BaseAction {
  async handle() {
    return cache.namespace(CacheNamespaces.TAXONOMIES).getOrSet({
      key: 'TOPIC_LIST',
      factory: () => GetTopicList.fromDb(),
    })
  }

  static async fromDb() {
    return GetTopicList.fromBuilder().dto(TopicDto)
  }

  static fromBuilder() {
    return Taxonomy.build().display().order()
  }
}
