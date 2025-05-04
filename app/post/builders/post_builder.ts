import AssetDto from '#asset/dtos/asset'
import Collection from '#collection/models/collection'
import BaseBuilder from '#core/builders/base_builder'
import Sorts from '#core/enums/sorts'
import States from '#core/enums/states'
import NotImplementedException from '#core/exceptions/not_implemented_exception'
import PostTypes from '#post/enums/post_types'
import Post from '#post/models/post'
import Taxonomy from '#taxonomy/models/taxonomy'
import AuthorDto from '#user/dtos/author'
import { RelationQueryBuilderContract } from '@adonisjs/lucid/types/relations'

export default class PostBuilder extends BaseBuilder<typeof Post, Post> {
  constructor() {
    super(Post)
  }

  static new() {
    return new PostBuilder()
  }

  display({ skipPublishCheck = false } = {}) {
    this.if(!skipPublishCheck, (builder) => builder.published())
    this.orderPublished().query.apply((scope) => scope.forDisplay())
    return this
  }

  displayShow({ skipPublishCheck = false } = {}) {
    this.if(!skipPublishCheck, (builder) => builder.published())
    this.orderPublished().query.apply((scope) => scope.forDisplayShow())
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

  whereHasTaxonomy(slug?: string) {
    if (!slug) return this
    this.query.whereHas('taxonomies', (query) => query.where('taxonomies.slug', slug))
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
    this.query.preload('authors', (query) => query.selectDto(AuthorDto))
    return this
  }

  withThumbnails() {
    this.query.preload('thumbnails', (query) => query.selectDto(AssetDto))
    return this
  }

  withCovers() {
    this.query.preload('covers', (query) => query.selectDto(AssetDto))
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
