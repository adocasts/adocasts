import PostBuilder from '#builders/post_builder'
import PostTypes from '#enums/post_types'
import States from '#enums/states'
import Comment from '#models/comment'
import Post from '#models/post'
import { inject } from '@adonisjs/core'
import { HttpContext } from '@adonisjs/core/http'
import bento from './bento_service.js'
import PostListVM from '../view_models/post.js'

@inject()
export default class PostService {
  constructor(protected ctx: HttpContext) {}

  get user() {
    return this.ctx.auth.user
  }

  get cache() {
    return bento.namespace('POSTS')
  }

  async getLatestLessonsForHome() {
    return this.cache.getOrSet('GET_LATEST_LESSONS_FOR_HOME', async () => {
      const latest = await this.getLatestLessons(12)
      return latest.map(post => PostListVM.get(post))
    })
  }

  async getLatestBlogsForHome() {
    return this.cache.getOrSet('GET_LATEST_BLOGS_FOR_HOME', async () => {
      const latest = await this.getLatestBlogs(3)
      return latest.map(post => PostListVM.get(post))
    })
  }

  async getLatestSnippetsForHome() {
    return this.cache.getOrSet('GET_LATEST_SNIPPETS_FOR_HOME', async () => {
      const latest = await this.getLatestSnippets(3)
      return latest.map(post => PostListVM.get(post))
    })
  }

  /**
   * Start a new post builder
   * @returns
   */
  builder() {
    return PostBuilder.new(this.user)
  }

  /**
   * Find or fail a post for display by a column value
   * @param column
   * @param value
   * @returns
   */
  findBy(column: keyof Post, value: any) {
    return this.builder()
      .where(column, value)
      .display({ skipPublishCheck: true })
      .watchlist()
      .withProgression()
      .withComments()
      .firstOrFail()
  }

  /**
   * Returns list of posts for display matching the postTypeIds
   * @param postTypeIds
   * @returns
   */
  getList(postTypeIds: PostTypes[] | PostTypes | null = null) {
    return this.builder()
      .if(postTypeIds, (builder) => builder.whereType(postTypeIds!))
      .display()
  }

  /**
   * Returns lessons and livestreams for display
   * @returns
   */
  getLessons() {
    return this.getList([PostTypes.LESSON, PostTypes.LIVESTREAM])
  }

  /**
   * Returns livestreams for display
   * @returns
   */
  getStreams() {
    return this.getList([PostTypes.LIVESTREAM])
  }

  /**
   * Returns snippets for display
   * @returns
   */
  getSnippets() {
    return this.getList([PostTypes.SNIPPET])
  }

  /**
   * Returns blogs and news for display
   * @returns
   */
  getBlogs() {
    return this.getList([PostTypes.BLOG, PostTypes.NEWS])
  }

  /**
   * Return the latest post items for display
   * @param limit
   * @param excludeIds
   * @param postTypeIds
   * @returns
   */
  getLatest(
    limit: number | undefined = undefined,
    excludeIds: number[] = [],
    postTypeIds: PostTypes[] | PostTypes | null = null
  ) {
    return this.getList(postTypeIds)
      .if(excludeIds, (builder) => builder.exclude(excludeIds))
      .if(limit, (query) => query.limit(limit!))
      .orderPublished()
  }

  /**
   * Returns the latest lessons & livestreams
   * @param limit
   * @param excludeIds
   * @returns
   */
  getLatestLessons(limit: number | undefined = undefined, excludeIds: number[] = []) {
    return this.getLatest(limit, excludeIds, [PostTypes.LESSON, PostTypes.LIVESTREAM])
  }

  /**
   * Returns the latest livestreams
   * @param limit
   * @param excludeIds
   * @returns
   */
  getLatestStreams(limit: number | undefined = undefined, excludeIds: number[] = []) {
    return this.getLatest(limit, excludeIds, [PostTypes.LIVESTREAM])
  }

  /**
   * Returns the latest blogs and news
   * @param limit
   * @param excludeIds
   * @returns
   */
  getLatestBlogs(limit: number | undefined = undefined, excludeIds: number[] = []) {
    return this.getLatest(limit, excludeIds, [PostTypes.BLOG, PostTypes.NEWS])
  }

  /**
   * Returns the latest code snippets
   * @param limit
   * @param excludeIds
   * @returns
   */
  getLatestSnippets(limit: number | undefined = undefined, excludeIds: number[] = []) {
    return this.getLatest(limit, excludeIds, [PostTypes.SNIPPET])
  }

  /**
   * Returns the number of lessons and livestreams published
   * @returns
   */
  getLessonCount() {
    return this.builder().whereLesson().published().count()
  }

  /**
   * Returns the total sum of lessons and livestream video duration
   * @returns
   */
  async getLessonDuration() {
    return this.builder().whereLesson().published().sum('video_seconds')
  }

  /**
   * Returns similar posts to the one provided
   * @param post
   * @param limit
   * @returns
   */
  async getSimilarPosts(post: Post, limit: number = 15) {
    const taxonomyIds = post.taxonomies.map((t) => t.id)
    const similarPostTypes = this.getSimilarPostTypes(post)
    let query = Post.query().apply((scope) => scope.published())

    query = query.whereIn('postTypeId', similarPostTypes).whereNot('id', post.id)

    if (taxonomyIds.length) {
      query = query
        .withAggregate('taxonomies', (agg) =>
          agg.whereIn('taxonomies.id', taxonomyIds).count('*').as('taxonomy_matches')
        )
        .orderBy('taxonomy_matches', 'desc')
    } else {
      query = query.orderBy('publishAt', 'desc')
    }

    return query.apply((scope) => scope.forDisplay()).limit(limit)
  }

  getSimilarPostTypes(post: Post) {
    switch (post.postTypeId) {
      case PostTypes.LESSON:
      case PostTypes.LIVESTREAM:
        return [PostTypes.LESSON, PostTypes.LIVESTREAM]
      default:
        // not enough content in the others, so just populate with everything
        return [
          PostTypes.BLOG,
          PostTypes.NEWS,
          PostTypes.SNIPPET,
          PostTypes.LINK,
          PostTypes.LESSON,
          PostTypes.LIVESTREAM,
        ]
    }
  }

  async search(term: string | undefined, limit: number = 15) {
    return this.builder()
      .display()
      .if(term, (builder) => builder.search(term!))
      .orderPublished()
      .limit(limit)
  }

  static async getCommentReload(postId: number) {
    const query = Comment.query().where({ postId })
    const comments = await query
      .clone()
      .whereIn('stateId', [States.PUBLIC, States.ARCHIVED])
      .preload('user')
      .preload('userVotes', (votes) => votes.select(['id']))
      .orderBy('createdAt', 'desc')

    const commentCountResult = await query
      .clone()
      .where('stateId', States.PUBLIC)
      .count('*', 'total')
      .first()

    const commentCount = commentCountResult?.$extras.total

    return { comments, commentCount }
  }
}
