import BaseAction from '#core/actions/base_action'
import GetTopicList from '#taxonomy/actions/get_topic_list'

export default class GetTopicsFilter extends BaseAction<['collections' | 'posts']> {
  async handle(type: 'collections' | 'posts') {
    if (type === 'collections') {
      return this.forCollections()
    } else {
      return this.forPosts()
    }
  }

  async forCollections() {
    return this.#get('collections_count')
  }

  async forPosts() {
    return this.#get('posts_count')
  }

  async #get(countField: string) {
    const topics = await GetTopicList.run()
    return topics.filter((topic) => Number(topic.meta[countField] || '0'))
  }
}
