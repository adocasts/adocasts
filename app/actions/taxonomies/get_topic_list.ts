import TopicDto from '../../dtos/topic.js'
import Taxonomy from '#models/taxonomy'
import BaseAction from '#actions/base_action'

export default class GetTopicList extends BaseAction {
  async handle() {
    const results = await GetTopicList.fromDb()

    // TODO: cache

    return results
  }

  static async fromDb() {
    return GetTopicList.fromBuilder().dto(TopicDto)
  }

  static fromBuilder() {
    return Taxonomy.build().display().order()
  }
}
