import BaseAction from '#actions/base_action'
import GetTopicList from '#actions/taxonomies/get_topic_list'
import NotImplementedException from '#exceptions/not_implemented_exception'
import Taxonomy from '#models/taxonomy'
import TopicDto from '../../dtos/topic.js'

type TopicTypes =
  | 'collections'
  | 'posts'
  | 'lessons'
  | 'streams'
  | 'blogs'
  | 'snippets'
  | 'discussions'
  | 'discussions_form'

export default class GetTopicsFilter extends BaseAction {
  async handle(type: TopicTypes) {
    switch (type) {
      case 'collections':
        return this.#get('collections_count')
      case 'posts':
        return this.#get('posts_count')
      case 'lessons':
        return this.#get('lessons_count')
      case 'streams':
        return this.#get('streams_count')
      case 'blogs':
        return this.#get('blogs_count')
      case 'snippets':
        return this.#get('snippets_count')
      case 'discussions':
        return this.#forDiscussions('list')
      case 'discussions_form':
        return this.#forDiscussions('form')
      default:
        throw new NotImplementedException(`${this.constructor.name} does not implement ${type}`)
    }
  }

  async #forDiscussions(purpose: 'form' | 'list') {
    const topics = await Taxonomy.build()
      .orderBy('name')
      .if(purpose === 'list', (query) => query.whereHasDiscussion())
      .withDiscussionCount()
      .dto(TopicDto)

    return topics.toSorted((a, b) => b.meta.discussions_count - a.meta.discussions_count)
  }

  async #get(countField: string) {
    const topics = await GetTopicList.run()
    return topics.filter((topic) => Number(topic.meta[countField] || '0'))
  }
}
