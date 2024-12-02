import { DateTime } from 'luxon'
import {
  beforeSave,
  belongsTo,
  column,
  computed,
  hasMany,
  manyToMany,
  scope,
} from '@adonisjs/lucid/orm'
import type { BelongsTo, HasMany, ManyToMany } from '@adonisjs/lucid/types/relations'
// import { slugify } from '@ioc:Adonis/Addons/LucidSlugify'
import Database from '@adonisjs/lucid/services/db'
import User from '#models/user'
import Post from '#models/post'
import Asset from '#models/asset'
import Taxonomy from '#models/taxonomy'
import CollectionTypes from '#enums/collection_types'
import Status from '#enums/status'
import State from '#enums/states'
import AppBaseModel from '#models/app_base_model'
import States from '#enums/states'
import Watchlist from '#models/watchlist'
import History from '#models/history'
import HistoryTypes from '#enums/history_types'
import { ModelQueryBuilderContract } from '@adonisjs/lucid/types/model'
import SlugService from '#services/slug_service'
import Progress from './progress.js'

export default class Collection extends AppBaseModel {
  @column({ isPrimary: true })
  declare id: number

  @column()
  declare ownerId: number

  @column()
  declare parentId: number | null

  @column()
  declare outdatedVersionId: number | null

  @column()
  declare collectionTypeId: CollectionTypes

  @column()
  declare statusId: Status

  @column()
  declare stateId: State

  @column()
  declare difficultyId: number | null

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
  declare youtubePlaylistUrl: string

  @column()
  declare repositoryUrl: string

  @column()
  declare isFeatured: boolean

  @column()
  declare sortOrder: number

  @column.dateTime({ autoCreate: true })
  declare createdAt: DateTime

  @column.dateTime({ autoCreate: true, autoUpdate: true })
  declare updatedAt: DateTime

  @computed()
  get isInWatchlist() {
    if (!this.$extras.watchlist_count) {
      return false
    }

    return Number(this.$extras.watchlist_count) > 0
  }

  @computed()
  get moduleNumber() {
    return this.sortOrder + 1
  }

  @belongsTo(() => User, {
    foreignKey: 'ownerId',
  })
  declare owner: BelongsTo<typeof User>

  @belongsTo(() => Asset)
  declare asset: BelongsTo<typeof Asset>

  @belongsTo(() => Collection)
  declare parent: BelongsTo<typeof Collection>

  @belongsTo(() => Collection, {
    localKey: 'outdatedVersionId',
  })
  declare outdatedVersion: BelongsTo<typeof Collection>

  @hasMany(() => Collection, {
    foreignKey: 'outdatedVersionId',
  })
  declare updatedVersions: HasMany<typeof Collection>

  @manyToMany(() => Post, {
    pivotTable: 'collection_posts',
    pivotColumns: ['sort_order', 'root_collection_id', 'root_sort_order'],
  })
  declare posts: ManyToMany<typeof Post>

  @manyToMany(() => Post, {
    pivotForeignKey: 'root_collection_id',
    pivotTable: 'collection_posts',
    pivotColumns: ['sort_order', 'root_collection_id', 'root_sort_order'],
  })
  declare postsFlattened: ManyToMany<typeof Post>

  @manyToMany(() => Taxonomy, {
    pivotColumns: ['sort_order'],
    pivotTable: 'collection_taxonomies',
  })
  declare taxonomies: ManyToMany<typeof Taxonomy>

  @hasMany(() => Collection, {
    foreignKey: 'parentId',
  })
  declare children: HasMany<typeof Collection>

  @hasMany(() => Watchlist)
  declare watchlist: HasMany<typeof Watchlist>

  @hasMany(() => History, {
    onQuery: (q) => q.where('historyTypeId', HistoryTypes.VIEW),
  })
  declare viewHistory: HasMany<typeof History>

  @hasMany(() => Progress)
  declare progressionHistory: HasMany<typeof Progress>

  @beforeSave()
  static async slugifyUsername(collection: Collection) {
    if (collection.$dirty.name && !collection.$dirty.slug) {
      const slugify = new SlugService<typeof Collection>({
        strategy: 'dbIncrement',
        fields: ['name'],
      })
      collection.slug = await slugify.make(Collection, 'slug', collection.name)
    }
  }

  static series() {
    return this.query().where('collectionTypeId', CollectionTypes.SERIES)
  }

  static courses() {
    return this.query().where('collectionTypeId', CollectionTypes.COURSE)
  }

  static playlists() {
    return this.query().where('collectionTypeId', CollectionTypes.PLAYLIST)
  }

  static paths() {
    return this.query().where('collectionTypeId', CollectionTypes.PATH)
  }

  static withPostLatestPublished = scope((query) => {
    query.select(
      Database.rawQuery(
        `(
        select
          p.publish_at
        from
          posts as p inner join collection_posts
            on p.id = collection_posts.post_id
            where
                  collections.id = collection_posts.root_collection_id
              and p.state_id = ?
              and p.is_personal = false
              and p.publish_at <= ?
            order by p.publish_at desc
            limit 1
      ) as latest_publish_at`,
        [States.PUBLIC, DateTime.now().toSQL()]
      )
    )
  })

  static withPublishedPostCount = scope<
    typeof Collection,
    (query: ModelQueryBuilderContract<typeof Collection>) => void
  >((query) => {
    query.withCount('postsFlattened', (post) => post.apply((postScope) => postScope.published()))
  })

  static withPublishedPostDuration = scope<
    typeof Collection,
    (query: ModelQueryBuilderContract<typeof Collection>) => void
  >((query) => {
    query.withAggregate('postsFlattened', (posts) =>
      posts
        .apply((postScope) => postScope.published())
        .sum('video_seconds')
        .as('videoSecondsSum')
    )
  })

  static get postCountSubQuery() {
    return Database.from('collection_posts')
      .where('root_collection_id', Database.ref('collections.id'))
      .count('*')
      .as('root_posts_count')
  }
}
