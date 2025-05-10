import Comment from '#models/comment'
import SlugService from '#services/slug_service'
import TimeService from '#services/time_service'
import DiscussionBuilder from '#builders/discussion_builder'
import DiscussionViewTypes from '#enums/discussion_view_types'
import DiscussionView from '#models/discussion_view'
import Taxonomy from '#models/taxonomy'
import User from '#models/user'
import { BaseModel, beforeSave, belongsTo, column, computed, hasMany } from '@adonisjs/lucid/orm'
import type { BelongsTo, HasMany } from '@adonisjs/lucid/types/relations'
import { DateTime } from 'luxon'
import DiscussionVote from './discussion_vote.js'
import router from '@adonisjs/core/services/router'

export default class Discussion extends BaseModel {
  static build = () => DiscussionBuilder.new()

  @column({ isPrimary: true })
  declare id: number

  @column()
  declare userId: number

  @column()
  declare taxonomyId: number

  @column()
  declare stateId: number

  @column()
  declare title: string

  @column()
  declare slug: string

  @column()
  declare body: string

  @column.dateTime({ autoCreate: true })
  declare createdAt: DateTime

  @column.dateTime({ autoCreate: true, autoUpdate: true })
  declare updatedAt: DateTime

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
    return TimeService.timeago(this.createdAt)
  }

  @computed()
  get updatedAgo() {
    return TimeService.timeago(this.updatedAt)
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

  @hasMany(() => DiscussionView, {
    onQuery(query) {
      query.where('typeId', DiscussionViewTypes.VIEW)
    },
  })
  declare views: HasMany<typeof DiscussionView>

  @hasMany(() => DiscussionView)
  declare impressions: HasMany<typeof DiscussionView>

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
}
