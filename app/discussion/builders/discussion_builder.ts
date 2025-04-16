import BaseBuilder from '#core/builders/base_builder'
import BaseVoteDto from '#core/dtos/base_vote_dto'
import States from '#core/enums/states'
import DiscussionVoteDto from '#discussion/dtos/discussion_vote'
import Discussion from '#discussion/models/discussion'
import Taxonomy from '#taxonomy/models/taxonomy'
import User from '#user/models/user'
import { RelationQueryBuilderContract } from '@adonisjs/lucid/types/relations'

export default class DiscussionBuilder extends BaseBuilder<typeof Discussion, Discussion> {
  constructor() {
    super(Discussion)
    this.beforeQuery(() => this.public(), 'public')
  }

  static new() {
    return new DiscussionBuilder()
  }

  public() {
    this.query.where({ stateId: States.PUBLIC })
    return this
  }

  withNonPublic() {
    this.removeBeforeQuery('public')
    return this
  }

  display() {
    this.query
      .preload('user', (query) => query.preload('profile'))
      .preload('taxonomy', (query) => query.preload('asset'))
      .preload('votes', (query) => query.select('id'))
  }

  search(pattern?: string) {
    if (!pattern) return this

    this.query.where((query) =>
      query
        .whereILike('title', `%${pattern}%`)
        .orWhereILike('body', `%${pattern}%`)
        .if(pattern.startsWith('@'), (startsWith) =>
          startsWith.orWhereHas('user', (orHas) =>
            orHas.whereILike('username', `%${pattern.replace('@', '')}%`)
          )
        )
    )

    return this
  }

  whereFeed(feed?: 'popular' | 'noreplies' | 'solved' | 'unsolved') {
    if (!feed) return this

    switch (feed) {
      case 'noreplies':
        this.query.whereDoesntHave('comments', (query) => query.where('stateId', States.PUBLIC))
        return this
      case 'solved':
        return this
      case 'unsolved':
        return this
      default:
        return this
    }
  }

  whereHasTaxonomy(slug?: string) {
    if (!slug) return this

    this.query.whereHas('taxonomy', (query) => query.where({ slug }))

    return this
  }

  withAuthor(
    userQuery?: (
      query: RelationQueryBuilderContract<typeof User, any>
    ) => RelationQueryBuilderContract<typeof User, any>
  ) {
    this.query.preload('user', (query) =>
      query.if(typeof userQuery === 'function', (q) => userQuery!(q))
    )
    return this
  }

  withTaxonomy(
    taxonomyQuery?: (
      query: RelationQueryBuilderContract<typeof Taxonomy, any>
    ) => RelationQueryBuilderContract<typeof Taxonomy, any>
  ) {
    this.query.preload('taxonomy', (query) =>
      query.if(typeof taxonomyQuery === 'function', (q) => taxonomyQuery!(q))
    )
    return this
  }

  withCommentPreview() {
    this.query.preload('comments', (query) =>
      query
        .preload('user')
        .where('stateId', States.PUBLIC)
        .orderBy('createdAt', 'desc')
        .groupLimit(3)
    )
    return this
  }

  withComments() {
    this.query.preload('comments', (query) =>
      query
        .preload('user')
        .preload('userVotes', (votes) => votes.selectDto(BaseVoteDto))
        .where('stateId', States.PUBLIC)
        .orderBy([
          { column: 'voteCount', order: 'desc' },
          { column: 'createdAt', order: 'desc' },
        ])
    )
  }

  withVotes() {
    this.query.preload('votes', (query) => query.selectDto(DiscussionVoteDto))
    return this
  }

  withCounts() {
    this.withCommentCount()
    this.withViewCount()
    this.withImpressionCount()
    return this
  }

  withCommentCount() {
    this.query.withCount('comments', (query) => query.where('stateId', States.PUBLIC))
    return this
  }

  withViewCount() {
    this.query.withCount('views')
    return this
  }

  withImpressionCount() {
    this.query.withCount('impressions')
    return this
  }
}
