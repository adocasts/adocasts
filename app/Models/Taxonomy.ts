import { DateTime } from 'luxon'
import { BelongsTo, belongsTo, column, HasMany, hasMany, ManyToMany, manyToMany, scope } from '@ioc:Adonis/Lucid/Orm'
import Asset from './Asset'
import Collection from './Collection'
import Post from './Post'
import { slugify } from '@ioc:Adonis/Addons/LucidSlugify'
import AppBaseModel from 'App/Models/AppBaseModel'
import Database from '@ioc:Adonis/Lucid/Database'
import States from 'App/Enums/States'
import History from 'App/Models/History'
import HistoryTypes from 'App/Enums/HistoryTypes'

export default class Taxonomy extends AppBaseModel {
  @column({ isPrimary: true })
  public id: number

  @column()
  public rootParentId: number | null

  @column()
  public parentId: number | null

  @column()
  public levelIndex: number

  @column()
  public assetId: number | null

  @column()
  public name: string

  @column()
  @slugify({
    strategy: 'dbIncrement',
    fields: ['name']
  })
  public slug: string

  @column()
  public description: string

  @column()
  public pageTitle: string

  @column()
  public metaDescription: string

  @column()
  public isFeatured: boolean

  @column.dateTime({ autoCreate: true })
  public createdAt: DateTime

  @column.dateTime({ autoCreate: true, autoUpdate: true })
  public updatedAt: DateTime

  @belongsTo(() => Asset)
  public asset: BelongsTo<typeof Asset>

  @belongsTo(() => Taxonomy, {
    foreignKey: 'parentId'
  })
  public parent: BelongsTo<typeof Taxonomy>

  @hasMany(() => Taxonomy, {
    foreignKey: 'parentId'
  })
  public children: HasMany<typeof Taxonomy>

  @hasMany(() => History, {
    onQuery: q => q.where('historyTypeId', HistoryTypes.VIEW)
  })
  public viewHistory: HasMany<typeof History>

  @hasMany(() => History, {
    onQuery: q => q.where('historyTypeId', HistoryTypes.PROGRESSION)
  })
  public progressionHistory: HasMany<typeof History>

  @manyToMany(() => Post, {
    pivotColumns: ['sort_order']
  })
  public posts: ManyToMany<typeof Post>

  @manyToMany(() => Collection, {
    pivotColumns: ['sort_order'],
    pivotTable: 'collection_taxonomies'
  })
  public collections: ManyToMany<typeof Collection>

  public static roots() {
    return this.query().whereNull('parentId')
  }

  public static children(parentId: number | null = null) {
    if (parentId) {
      return this.query().where('parentId', parentId)
    }

    return this.query().whereNotNull('parentId')
  }

  public static hasContent = scope<typeof Taxonomy>((query) => {
    query.where(q => q
      .orWhereHas('posts', p => p.apply(scope => scope.published()))
      .orWhereHas('collections', p => p.wherePublic())
    )
  })

  public static withPostLatestPublished = scope<typeof Taxonomy>((query) => {
    query.select(
      Database.rawQuery(`(
        select
          p.publish_at
        from
          posts as p inner join post_taxonomies
            on p.id = post_taxonomies.post_id
            where
                  taxonomies.id = post_taxonomies.taxonomy_id
              and p.state_id = ?
              and p.is_personal = false
              and p.publish_at <= ?
            order by p.publish_at desc
            limit 1
      ) as latest_publish_at`, [States.PUBLIC, DateTime.local().toSQL()])
    )
  })
}
