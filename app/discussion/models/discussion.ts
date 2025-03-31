import Comment from '#comment/models/comment'
import SlugService from '#core/services/slug_service'
import TimeService from '#core/services/time_service'
import DiscussionViewTypes from '#discussion/enums/discussion_view_types'
import DiscussionView from '#discussion/models/discussion_view'
import Taxonomy from '#taxonomy/models/taxonomy'
import User from '#user/models/user'
import {
  BaseModel,
  beforeSave,
  belongsTo,
  column,
  computed,
  hasMany,
  manyToMany,
} from '@adonisjs/lucid/orm'
import type { BelongsTo, HasMany, ManyToMany } from '@adonisjs/lucid/types/relations'
import { DateTime } from 'luxon'

export default class Discussion extends BaseModel {
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

  @manyToMany(() => User, {
    pivotTable: 'discussion_votes',
  })
  declare votes: ManyToMany<typeof User>

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
