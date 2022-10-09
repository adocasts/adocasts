import { DateTime } from 'luxon'
import {
  BelongsTo,
  belongsTo,
  column, computed, HasMany, hasMany,
  ManyToMany,
  manyToMany, scope
} from '@ioc:Adonis/Lucid/Orm'
import CollectionTypes from 'App/Enums/CollectionTypes'
import Status from 'App/Enums/Status'
import User from './User'
import Post from './Post'
import Taxonomy from './Taxonomy'
import Asset from './Asset'
import State from 'App/Enums/States'
import { slugify } from '@ioc:Adonis/Addons/LucidSlugify'
import AppBaseModel from 'App/Models/AppBaseModel'
import Database from '@ioc:Adonis/Lucid/Database'
import States from 'App/Enums/States'
import Watchlist from 'App/Models/Watchlist'
import History from 'App/Models/History'
import HistoryTypes from 'App/Enums/HistoryTypes'

export default class Collection extends AppBaseModel {
  @column({ isPrimary: true })
  public id: number

  @column()
  public ownerId: number

  @column()
  public parentId: number | null

  @column()
  public outdatedVersionId: number | null

  @column()
  public collectionTypeId: CollectionTypes

  @column()
  public statusId: Status

  @column()
  public stateId: State

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
  public youtubePlaylistUrl: string

  @column()
  public repositoryUrl: string

  @column()
  public isFeatured: boolean

  @column()
  public sortOrder: number

  @column.dateTime({ autoCreate: true })
  public createdAt: DateTime

  @column.dateTime({ autoCreate: true, autoUpdate: true })
  public updatedAt: DateTime

  @computed()
  public get isInWatchlist() {
    if (!this.$extras.watchlist_count) {
      return false
    }

    return Number(this.$extras.watchlist_count) > 0
  }

  @belongsTo(() => User)
  public owner: BelongsTo<typeof User>

  @belongsTo(() => Asset)
  public asset: BelongsTo<typeof Asset>

  @belongsTo(() => Collection)
  public parent: BelongsTo<typeof Collection>

  @belongsTo(() => Collection, {
    localKey: 'outdatedVersionId'
  })
  public outdatedVersion: BelongsTo<typeof Collection>

  @hasMany(() => Collection, {
    foreignKey: 'outdatedVersionId'
  })
  public updatedVersions: HasMany<typeof Collection>

  @manyToMany(() => Post, {
    pivotTable: 'collection_posts',
    pivotColumns: ['sort_order', 'root_collection_id', 'root_sort_order']
  })
  public posts: ManyToMany<typeof Post>

  @manyToMany(() => Post, {
    pivotForeignKey: 'root_collection_id',
    pivotTable: 'collection_posts',
    pivotColumns: ['sort_order', 'root_collection_id', 'root_sort_order']
  })
  public postsFlattened: ManyToMany<typeof Post>

  @manyToMany(() => Taxonomy, {
    pivotColumns: ['sort_order'],
    pivotTable: 'collection_taxonomies'
  })
  public taxonomies: ManyToMany<typeof Taxonomy>

  @hasMany(() => Collection, {
    foreignKey: 'parentId'
  })
  public children: HasMany<typeof Collection>

  @hasMany(() => Watchlist)
  public watchlist: HasMany<typeof Watchlist>

  @hasMany(() => History, {
    onQuery: q => q.where('historyTypeId', HistoryTypes.VIEW)
  })
  public viewHistory: HasMany<typeof History>

  @hasMany(() => History, {
    onQuery: q => q.where('historyTypeId', HistoryTypes.PROGRESSION)
  })
  public progressionHistory: HasMany<typeof History>

  public static series() {
    return this.query().where('collectionTypeId', CollectionTypes.SERIES)
  }

  public static courses() {
    return this.query().where('collectionTypeId', CollectionTypes.COURSE)
  }

  public static playlists() {
    return this.query().where('collectionTypeId', CollectionTypes.PLAYLIST)
  }

  public static withPostLatestPublished = scope<typeof Collection>((query) => {
    query.select(
      Database.rawQuery(`(
        select
          p.publish_at
        from
          posts as p inner join collection_posts
            on p.id = collection_posts.post_id
            where
                  collections.id = collection_posts.collection_id
              and p.state_id = ?
              and p.is_personal = false
              and p.publish_at <= ?
            order by p.publish_at desc
            limit 1
      ) as latest_publish_at`, [States.PUBLIC, DateTime.local().toSQL()])
    )
  })

  public static withPublishedPostCount = scope<typeof Collection>((query) => {
    query.withCount('postsFlattened', post => post.apply(scope => scope.published()))
  })

  public static withPublishedPostDuration = scope<typeof Collection>((query) => {
    query.withAggregate('postsFlattened', query => query
      .apply(scope => scope.published())
      .sum('video_seconds')
      .as('videoSecondsSum')
    )
  })

  public static get postCountSubQuery() {
    return Database
      .from('collection_posts')
      .where('root_collection_id', Database.ref('collections.id'))
      .count('*')
      .as('root_posts_count')
  }
}
