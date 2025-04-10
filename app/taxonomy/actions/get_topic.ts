import BaseAction from '#core/actions/base_action'
import NotFoundException from '#core/exceptions/not_found_exception'
import GetTopicList from './get_topic_list.js'

export default class GetTopic extends BaseAction<[string]> {
  async handle(slug: string) {
    const topics = await GetTopicList.run()
    const topic = topics.find((row) => row.slug === slug)

    if (!topic) {
      throw new NotFoundException(`No topic found for slug: ${slug}`)
    }

    topic.children = topics.filter((row) => row.parentId === topic.id)

    return topic
  }
}
