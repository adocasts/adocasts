import BaseBuilder from '#builders/base_builder'
import PostTypes from '#enums/post_types'
import Sorts from '#enums/sorts'
import States from '#enums/states'
import NotImplementedException from '#exceptions/not_implemented_exception'
import type Collection from '#models/collection'
import Post from '#models/post'
import type Taxonomy from '#models/taxonomy'
import { type RelationQueryBuilderContract } from '@adonisjs/lucid/types/relations'

export interface DisplayOptions {
  skipPublishCheck: boolean
}

export default class PostBuilder extends BaseBuilder<typeof Post, Post> {
  constructor() {
    super(Post)
  }

  static new() {
    return new PostBuilder()
  }

  displayLesson(options?: DisplayOptions) {
    this.whereLesson()
    this.if(!options?.skipPublishCheck, (builder) => builder.published())
    this.orderPublished().query.apply((scope) => scope.forLessonDisplay())
    return this
  }

  displayLessonShow(options?: DisplayOptions) {
    this.whereLesson()
    this.if(!options?.skipPublishCheck, (builder) => builder.published())
    this.orderPublished().query.apply((scope) => scope.forLessonDisplayShow())
    return this
  }

  displayStream(options?: DisplayOptions) {
    this.whereStream()
    this.if(!options?.skipPublishCheck, (builder) => builder.published())
    this.orderPublished().query.apply((scope) => scope.forLessonDisplay())
    return this
  }

  displayBlog(options?: DisplayOptions) {
    this.whereBlog()
    this.if(!options?.skipPublishCheck, (builder) => builder.published())
    this.orderPublished().query.apply((scope) => scope.forBlogDisplay())
    return this
  }

  displayBlogShow(options?: DisplayOptions) {
    this.whereBlog()
    this.if(!options?.skipPublishCheck, (builder) => builder.published())
    this.orderPublished().query.apply((scope) => scope.forBlogDisplayShow())
    return this
  }

  displaySnippet(options?: DisplayOptions) {
    this.whereType(PostTypes.SNIPPET)
    this.if(!options?.skipPublishCheck, (builder) => builder.published())
    this.orderPublished().query.apply((scope) => scope.forBlogDisplay())
    return this
  }

  displaySnippetShow(options?: DisplayOptions) {
    this.whereType(PostTypes.SNIPPET)
    this.if(!options?.skipPublishCheck, (builder) => builder.published())
    this.orderPublished().query.apply((scope) => scope.forBlogDisplayShow())
    return this
  }

  published() {
    this.query.apply((scope) => scope.published())
    return this
  }

  search(term?: string) {
    if (!term) return this
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

  whereStream() {
    this.query.where('postTypeId', PostTypes.LIVESTREAM)
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

  whereHasTaxonomy(slug?: string | string[]) {
    if (Array.isArray(slug)) {
      this.query.whereHas('taxonomies', (query) => query.whereIn('taxonomies.slug', slug))
    } else if (slug) {
      this.query.whereHas('taxonomies', (query) => query.where('taxonomies.slug', slug))
    }

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

  whereInWatchlist(userId: number) {
    this.query.whereHas('watchlist', (query) => query.where({ userId }))
    return this
  }

  withSeries(
    seriesQuery?: (
      query: RelationQueryBuilderContract<typeof Collection, any>
    ) => RelationQueryBuilderContract<typeof Collection, any>
  ) {
    this.query.preload('rootSeries', (query) =>
      query.if(typeof seriesQuery === 'function', (q) => seriesQuery!(q))
    )
    return this
  }

  withSeriesParent(
    seriesQuery?: (
      query: RelationQueryBuilderContract<typeof Collection, any>
    ) => RelationQueryBuilderContract<typeof Collection, any>
  ) {
    this.query.preload('series', (query) =>
      query.if(typeof seriesQuery === 'function', (q) => seriesQuery!(q))
    )
    return this
  }

  withTaxonomies(
    taxonomyQuery?: (
      query: RelationQueryBuilderContract<typeof Taxonomy, any>
    ) => RelationQueryBuilderContract<typeof Taxonomy, any>
  ) {
    this.query.preload('taxonomies', (query) =>
      query.if(typeof taxonomyQuery === 'function', (q) => taxonomyQuery!(q))
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

  withAuthors() {
    this.query.preload('authors')
    return this
  }

  withThumbnails() {
    this.query.preload('thumbnails')
    return this
  }

  withCovers() {
    this.query.preload('covers')
    return this
  }

  withCaptions() {
    this.query.preload('captions', (query) => query.orderBy('sort_order'))
    return this
  }

  withChapters() {
    this.query.preload('chapters', (query) => query.orderBy('sort_order'))
    return this
  }

  orderBySort(sort?: Sorts) {
    if (!sort) return this

    this.query.clearOrder()

    switch (sort) {
      case Sorts.ALPHA:
        this.orderBy('title', 'asc')
        break
      case Sorts.LATEST:
        this.orderPublished()
        break
      case Sorts.LATEST_UPDATED:
        this.query.orderByRaw('COALESCE(updated_content_at, publish_at) DESC, created_at DESC')
        break
      case Sorts.LONGEST:
        this.orderBy('videoSeconds', 'desc')
        break
      case Sorts.SHORTEST:
        this.orderBy('videoSeconds', 'asc')
        break
      case Sorts.POPULAR:
        throw new NotImplementedException(`PostBuilder.orderBySort has not yet implemented popular`)
    }

    return this
  }

  orderPublished() {
    this.query.orderBy([
      { column: 'publishAt', order: 'desc' },
      { column: 'createdAt', order: 'desc' },
    ])
    return this
  }
}
