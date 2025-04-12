import BaseAction from '#core/actions/base_action'
import NotImplementedException from '#core/exceptions/not_implemented_exception'
import GetTopicList from '#taxonomy/actions/get_topic_list'
import BaseTopicDto from '#taxonomy/dtos/base_topic'
import Taxonomy from '#taxonomy/models/taxonomy'

export default class GetTopicsFilter extends BaseAction<['collections' | 'posts' | 'discussions']> {
  async handle(type: 'collections' | 'posts' | 'discussions') {
    switch (type) {
      case 'collections':
        return this.forCollections()
      case 'posts':
        return this.forPosts()
      case 'discussions':
        return this.forDiscussions()
      default:
        throw new NotImplementedException(`${this.constructor.name} does not implement ${type}`)
    }
  }

  async forCollections() {
    return this.#get('collections_count')
  }

  async forPosts() {
    return this.#get('posts_count')
  }

  async forDiscussions() {
    return Taxonomy.build().orderBy('name').dto(BaseTopicDto)
  }

  async #get(countField: string) {
    const topics = await GetTopicList.run()
    return topics.filter((topic) => Number(topic.meta[countField] || '0'))
  }
}
