import GetTopicList from '#taxonomy/actions/get_topic_list'

export default class GetTopicsFilter {
  static async forCollections() {
    return this.#get('collections_count')
  }

  static async forPosts() {
    return this.#get('posts_count')
  }

  static async #get(countField: string) {
    const topics = await GetTopicList.run()
    return topics.filter((topic) => Number(topic.meta[countField] || '0'))
  }
}
