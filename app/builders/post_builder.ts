import PostTypes from '#enums/post_types'
import States from '#enums/states'
import Post from '#models/post'
import Taxonomy from '#models/taxonomy'
import BaseTopicDto from '../dtos/topics/base_topic.js'
import BaseBuilder from './base_builder.js'

export default class PostBuilder extends BaseBuilder<typeof Post, Post> {
  constructor() {
    super(Post)
  }

  static new() {
    return new PostBuilder()
  }

  display({ skipPublishCheck = false } = {}) {
    this.if(!skipPublishCheck, (builder) => builder.published())
    this.orderPublished()
    // this.withProgression()
    this.query.apply((scope) => scope.forDisplay())
    return this
  }

  published() {
    this.query.apply((scope) => scope.published())
    return this
  }

  search(term: string) {
    this.query.where((query) =>
      query
        .where('title', 'ILIKE', `%${term}%`)
        .orWhere('description', 'ILIKE', `%${term}%`)
        .orWhere('body', 'ILIKE', `${term}`)
    )
    return this
  }

  whereLesson() {
    this.query.whereIn('postTypeId', [PostTypes.LESSON, PostTypes.LIVESTREAM])
    return this
  }

  whereBlog() {
    this.query.whereIn('postTypeId', [PostTypes.BLOG, PostTypes.NEWS])
    return this
  }

  whereType(postTypeIds: PostTypes[] | PostTypes) {
    this.query.if(
      Array.isArray(postTypeIds),
      (query) =>
        query.where((q) =>
          (<PostTypes[]>postTypeIds).map((postTypeId) => q.orWhere({ postTypeId }))
        ),
      (query) => query.where({ postTypeId: postTypeIds })
    )
    return this
  }

  whereHasTaxonomy(taxonomy: Taxonomy | BaseTopicDto) {
    this.query.whereHas('taxonomies', (query) => query.where('taxonomies.id', taxonomy.id))
    return this
  }

  whereHasTaxonomies(taxonomies: Taxonomy[] | undefined = undefined) {
    this.query.if(
      taxonomies,
      (query) =>
        query.whereHas('taxonomies', (tax) =>
          tax.whereIn(
            'taxonomies.id',
            taxonomies!.map((item) => item.id)
          )
        ),
      (query) => query.whereHas('taxonomies', (tax) => tax.apply((scope) => scope.hasContent()))
    )
    return this
  }

  withComments() {
    this.withCommentCount()
    this.query.preload('comments', (query) =>
      query
        .whereIn('stateId', [States.PUBLIC, States.ARCHIVED])
        .preload('user')
        .preload('userVotes', (votes) => votes.select('id'))
        .orderBy('createdAt')
    )
    return this
  }

  withCommentCount() {
    this.query.withCount('comments', (query) => query.where('stateId', States.PUBLIC))
  }

  orderPublished() {
    this.query.orderBy([
      { column: 'publishAt', order: 'desc' },
      { column: 'createdAt', order: 'desc' },
    ])
    return this
  }
}
