import GetTopics from './get_topics.js'

export default class GetTopicsFilter {
  static async forCollections() {
    return this.#get('collections_count')
  }

  static async forPosts() {
    return this.#get('posts_count')
  }

  static async #get(countField: string) {
    const topics = await GetTopics.fromCache()
    return topics.filter((topic) => Number(topic.meta[countField] || '0'))
  }
}
