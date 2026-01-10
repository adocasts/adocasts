import DiscussionBuilder from '#builders/discussion_builder'
import { DiscussionSchema } from '#database/schema'
import CommentTypes from '#enums/comment_types'
import DiscussionViewTypes from '#enums/discussion_view_types'
import States from '#enums/states'
import Comment from '#models/comment'
import DiscussionView from '#models/discussion_view'
import Taxonomy from '#models/taxonomy'
import User from '#models/user'
import timeHelpers from '#services/helpers/time'
import SlugService from '#services/core/slug_service'
import router from '@adonisjs/core/services/router'
import { beforeSave, belongsTo, computed, hasMany, scope } from '@adonisjs/lucid/orm'
import Database from '@adonisjs/lucid/services/db'
import type { BelongsTo, HasMany } from '@adonisjs/lucid/types/relations'
import { DateTime } from 'luxon'
import DiscussionVote from './discussion_vote.js'

export default class Discussion extends DiscussionSchema {
  static build = () => DiscussionBuilder.new()

  @computed()
  get createdAtDisplay() {
    if (!this.createdAt) return ''

    if (DateTime.now().year === this.createdAt.year) {
      return this.createdAt.toFormat('MMM dd')
    }

    return this.createdAt.toFormat('MMM dd, yy')
  }

  @computed()
  get updatedAtDisplay() {
    if (!this.updatedAt) return ''

    if (DateTime.now().year === this.updatedAt.year) {
      return this.updatedAt.toFormat('MMM dd')
    }

    return this.updatedAt.toFormat('MMM dd, yy')
  }

  @computed()
  get createdAgo() {
    return timeHelpers.timeago(this.createdAt)
  }

  @computed()
  get updatedAgo() {
    return timeHelpers.timeago(this.updatedAt)
  }

  @computed()
  get routeUrl() {
    return router.makeUrl('discussions.show', { slug: this.slug })
  }

  @belongsTo(() => User)
  declare user: BelongsTo<typeof User>

  @belongsTo(() => Taxonomy)
  declare taxonomy: BelongsTo<typeof Taxonomy>

  @hasMany(() => Comment)
  declare comments: HasMany<typeof Comment>

  @belongsTo(() => Comment, {
    foreignKey: 'solved_comment_id',
  })
  declare solvedComment: BelongsTo<typeof Comment>

  @hasMany(() => DiscussionView, {
    onQuery(query) {
      query.where('typeId', DiscussionViewTypes.VIEW)
    },
  })
  declare discussionViews: HasMany<typeof DiscussionView>

  @hasMany(() => DiscussionView)
  declare discussionImpressions: HasMany<typeof DiscussionView>

  @hasMany(() => DiscussionVote)
  declare votes: HasMany<typeof DiscussionVote>

  @beforeSave()
  static async slugify(discussion: Discussion) {
    if (discussion.$dirty.title && !discussion.slug) {
      const slugify = new SlugService<typeof Discussion>({
        strategy: 'dbIncrement',
        fields: ['title'],
      })
      discussion.slug = await slugify.make(Discussion, 'slug', discussion.title)
    }
  }

  static withCommentLatestPublished = scope((query) => {
    query.select(
      Database.rawQuery(
        `(
        select
          c.created_at
        from
          comments as c
            where
                  discussions.id = c.discussion_id
              and c.state_id = ?
              and c.comment_type_id = ?
            order by c.created_at desc
            limit 1
      ) as latest_comment_at`,
        [States.PUBLIC, CommentTypes.DISCUSSION]
      )
    )
  })

  static orderByCommentLatestPublished = scope((query) => {
    query.orderByRaw(
      `
      COALESCE(
        (
            SELECT c.created_at
            FROM comments AS c
            WHERE discussions.id = c.discussion_id
                AND c.state_id = ?
                AND c.comment_type_id = ?
            ORDER BY c.created_at DESC
            LIMIT 1
        ),
        created_at
      ) DESC
    `,
      [States.PUBLIC, CommentTypes.DISCUSSION]
    )
  })
}
