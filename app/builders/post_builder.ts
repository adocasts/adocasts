import PostTypes from '#enums/post_types'
import States from '#enums/states'
import Post from '#models/post'
import Taxonomy from '#models/taxonomy'
import User from '#models/user'
import BaseBuilder from './base_builder.js'

export default class PostBuilder extends BaseBuilder<typeof Post, Post> {
  constructor(protected user: User | undefined = undefined) {
    super(Post)
  }

  static new(user: User | undefined = undefined) {
    return new PostBuilder(user)
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

  watchlist() {
    if (!this.user) return this
    this.query.withCount('watchlist', (query) => query.where('userId', this.user!.id))
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

  whereInWatchlist() {
    this.query.whereHas('watchlist', (query) => query.where('userId', this.user!.id))
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

  whereHasTaxonomy(taxonomy: Taxonomy) {
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

  withProgression() {
    if (!this.user) return this
    this.query.preload('progressionHistory', (query) =>
      query.where('userId', this.user!.id).orderBy('updatedAt', 'desc').groupLimit(1)
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

