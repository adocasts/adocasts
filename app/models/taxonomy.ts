import {
  BaseModel,
  beforeSave,
  belongsTo,
  column,
  computed,
  hasMany,
  manyToMany,
  scope,
} from '@adonisjs/lucid/orm'
import type { BelongsTo, HasMany, ManyToMany } from '@adonisjs/lucid/types/relations'
import { DateTime } from 'luxon'
// import { slugify } from '@ioc:Adonis/Addons/LucidSlugify'
import Asset from '#models/asset'
import Collection from '#models/collection'
import States from '#enums/states'
import SlugService from '#services/slug_service'
import HistoryTypes from '#enums/history_types'
import History from '#models/history'
import Post from '#models/post'
import TaxonomyBuilder from '#builders/taxonomy_builder'
import User from '#models/user'
import Database from '@adonisjs/lucid/services/db'
import { ModelQueryBuilderContract } from '@adonisjs/lucid/types/model'
import Discussion from '#models/discussion'

export default class Taxonomy extends BaseModel {
  static build = () => TaxonomyBuilder.new()

  @column({ isPrimary: true })
  declare id: number

  @column()
  declare ownerId: number

  @column()
  declare rootParentId: number | null

  @column()
  declare parentId: number | null

  @column()
  declare levelIndex: number

  @column()
  declare assetId: number | null

  @column()
  declare name: string

  @column()
  // @slugify({
  //   strategy: 'dbIncrement',
  //   fields: ['name']
  // })
  declare slug: string

  @column()
  declare description: string

  @column()
  declare pageTitle: string

  @column()
  declare metaDescription: string

  @column()
  declare isFeatured: boolean

  @column.dateTime({ autoCreate: true })
  declare createdAt: DateTime

  @column.dateTime({ autoCreate: true, autoUpdate: true })
  declare updatedAt: DateTime

  @belongsTo(() => User, {
    foreignKey: 'ownerId',
  })
  declare owner: BelongsTo<typeof User>

  @belongsTo(() => Asset)
  declare asset: BelongsTo<typeof Asset>

  @belongsTo(() => Taxonomy, {
    foreignKey: 'parentId',
  })
  declare parent: BelongsTo<typeof Taxonomy>

  @hasMany(() => Taxonomy, {
    foreignKey: 'parentId',
  })
  declare children: HasMany<typeof Taxonomy>

  @hasMany(() => History, {
    onQuery: (q) => q.where('historyTypeId', HistoryTypes.VIEW),
  })
  declare viewHistory: HasMany<typeof History>

  @hasMany(() => History, {
    onQuery: (q) => q.where('historyTypeId', HistoryTypes.PROGRESSION),
  })
  declare progressionHistory: HasMany<typeof History>

  @hasMany(() => Discussion)
  declare discussions: HasMany<typeof Discussion>

  @manyToMany(() => Post, {
    pivotColumns: ['sort_order'],
  })
  declare posts: ManyToMany<typeof Post>

  @manyToMany(() => Collection, {
    pivotColumns: ['sort_order'],
    pivotTable: 'collection_taxonomies',
  })
  declare collections: ManyToMany<typeof Collection>

  @computed()
  get abbrev() {
    const acronym = this.name
      .match(/\b([A-Z])/g)
      ?.reduce(
        (previous, next) =>
          previous + (+next === 0 || Number.parseInt(next) ? Number.parseInt(next) : next[0] || ''),
        ''
      )
      .toUpperCase()
    return acronym ?? ''
  }

  @beforeSave()
  static async slugifyUsername(taxonomy: Taxonomy) {
    if (taxonomy.$dirty.name && !taxonomy.$dirty.slug) {
      const slugify = new SlugService<typeof Taxonomy>({
        strategy: 'dbIncrement',
        fields: ['name'],
      })
      taxonomy.name = await slugify.make(Taxonomy, 'slug', taxonomy.name)
    }
  }

  static roots() {
    return this.query().whereNull('parentId')
  }

  static children(parentId: number | null = null) {
    if (parentId) {
      return this.query().where('parentId', parentId)
    }

    return this.query().whereNotNull('parentId')
  }

  static hasContent = scope<
    typeof Taxonomy,
    (query: ModelQueryBuilderContract<typeof Taxonomy>) => void
  >((query) => {
    query.where((q) =>
      q
        .orWhereHas('posts', (p) => p.apply((s) => s.published()))
        .orWhereHas('collections', (p) =>
          p
            .where({ stateId: States.PUBLIC })
            .whereHas('postsFlattened', (posts) => posts.apply((s) => s.published()))
        )
    )
  })

  static withPostLatestPublished = scope<
    typeof Taxonomy,
    (query: ModelQueryBuilderContract<typeof Taxonomy>) => void
  >((query) => {
    query.select(
      Database.rawQuery(
        `(
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
      ) as latest_publish_at`,
        [States.PUBLIC, DateTime.local().toSQL()]
      )
    )
  })
}
