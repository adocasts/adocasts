import { DateTime } from 'luxon'
import { BaseModel, beforeSave, belongsTo, column, computed, hasMany } from '@adonisjs/lucid/orm'
import User from './user.js'
import Comment from './comment.js'
import type { BelongsTo, HasMany } from '@adonisjs/lucid/types/relations'
import Taxonomy from './taxonomy.js'
import SlugService from '#services/slug_service'
import UtilityService from '#services/utility_service'

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

  @column()
  declare views: number

  @column.dateTime({ autoCreate: true })
  declare createdAt: DateTime

  @column.dateTime({ autoCreate: true, autoUpdate: true })
  declare updatedAt: DateTime

  @computed()
  public get createdAtDisplay() {
    if (!this.createdAt) return ''

    if (DateTime.now().year === this.createdAt.year) {
      return this.createdAt.toFormat('MMM dd')
    }

    return this.createdAt.toFormat('MMM dd, yy')
  }

  @computed()
  public get updatedAtDisplay() {
    if (!this.updatedAt) return ''

    if (DateTime.now().year === this.updatedAt.year) {
      return this.updatedAt.toFormat('MMM dd')
    }

    return this.updatedAt.toFormat('MMM dd, yy')
  }

  @computed()
  public get timeago() {
    return UtilityService.timeago(this.createdAt)
  }

  @belongsTo(() => User)
  declare user: BelongsTo<typeof User>

  @belongsTo(() => Taxonomy)
  declare taxonomy: BelongsTo<typeof Taxonomy>

  @hasMany(() => Comment)
  declare comments: HasMany<typeof Comment>

  @beforeSave()
  public static async slugify(discussion: Discussion) {
    if (discussion.$dirty.title && !discussion.slug) {
      const slugify = new SlugService<typeof Discussion>({ strategy: 'dbIncrement', fields: ['title'] })
      discussion.slug = await slugify.make(Discussion, 'title', discussion.title)
    }
  }
}