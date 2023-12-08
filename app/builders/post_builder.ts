import PostTypes from "#enums/post_types";
import States from "#enums/states";
import Post from "#models/post";
import Taxonomy from "#models/taxonomy";
import User from "#models/user";
import BaseBuilder from "./base_builder.js";

export default class PostBuilder extends BaseBuilder<typeof Post, Post> {
  constructor(protected user: User | undefined = undefined) {
    super(Post)
  }

  public static new(user: User | undefined = undefined) {
    return new PostBuilder(user)
  }

  public display({ skipPublishCheck = false } = {}) {
    this.if(!skipPublishCheck, builder => builder.published())
    this.orderPublished()
    this.query.apply(scope => scope.forDisplay())
    return this
  }

  public published() {
    this.query.apply(scope => scope.published())
    return this
  }

  public watchlist() {
    if (!this.user) return this
    this.query.withCount('watchlist', query => query.where('userId', this.user!.id))
    return this
  }

  public search(term: string) {
    this.query.where(query => query
      .where('title', 'ILIKE', `%${term}%`)
      .orWhere('description', 'ILIKE', `%${term}%`)
      .orWhere('body', 'ILIKE', `${term}`)
    )
    return this
  }

  public whereLesson() {
    this.query.whereIn('postTypeId', [PostTypes.LESSON, PostTypes.LIVESTREAM])
    return this
  }

  public whereBlog() {
    this.query.whereIn('postTypeId', [PostTypes.BLOG, PostTypes.NEWS])
    return this
  }

  public whereType(postTypeIds: PostTypes[] | PostTypes) {
    this.query.if(Array.isArray(postTypeIds),
      query => query.where(q => (<PostTypes[]>postTypeIds).map(postTypeId => q.orWhere({ postTypeId }))),
      query => query.where({ postTypeId: postTypeIds })
    )
    return this
  }

  public whereHasTaxonomy(taxonomy: Taxonomy) {
    this.query.whereHas('taxonomies', query => query.where('taxonomies.id', taxonomy.id))
    return this
  }

  public whereHasTaxonomies(taxonomies: Taxonomy[] | undefined = undefined) {
    this.query
      .if(taxonomies, 
        query => query.whereHas('taxonomies', query => query.whereIn('taxonomies.id', taxonomies!.map(tax => tax.id))),
        query => query.whereHas('taxonomies', query => query.apply(scope => scope.hasContent()))
      )
    return this
  }

  public withProgression() {
    if (!this.user) return this
    this.query.preload('progressionHistory', query => query
      .where('userId', this.user!.id)
      .orderBy('updatedAt', 'desc')
      .groupLimit(1)
    )
    return this
  }

  public withComments() {
    this.withCommentCount()
    this.query.preload('comments', query => query
      .whereIn('stateId', [States.PUBLIC, States.ARCHIVED])
      .preload('user')
      .preload('userVotes', query => query.select('id'))
      .orderBy('createdAt', 'desc')
    )
    return this
  }

  public withCommentCount() {
    this.query.withCount('comments', query => query.where('stateId', States.PUBLIC))
  }

  public orderPublished() {
    this.query.orderBy([
      { column: 'publishAt', order: 'desc' },
      { column: 'createdAt', order: 'desc' }
    ])
    return this
  }
}