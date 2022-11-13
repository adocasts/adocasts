import { DateTime } from 'luxon'
import {
  beforeSave,
  column,
  computed,
  HasMany,
  hasMany,
  ManyToMany,
  manyToMany, scope
} from '@ioc:Adonis/Lucid/Orm'
import Asset from './Asset'
import PostSnapshot from './PostSnapshot'
import User from './User'
import { slugify } from '@ioc:Adonis/Addons/LucidSlugify'
import State from 'App/Enums/States'
import Taxonomy from "App/Models/Taxonomy"
import ReadService from 'App/Services/ReadService'
import BodyTypes from 'App/Enums/BodyTypes'
import EditorBlockParser from 'App/Services/EditorBlockParser'
import PostType from 'App/Enums/PostType'
import Comment from './Comment'
import AppBaseModel from 'App/Models/AppBaseModel'
import States from 'App/Enums/States'
import Collection from 'App/Models/Collection'
import CollectionTypes from 'App/Enums/CollectionTypes'
import Watchlist from 'App/Models/Watchlist'
import * as timeago from 'timeago.js'
import History from 'App/Models/History'
import HistoryTypes from 'App/Enums/HistoryTypes'
import Route from '@ioc:Adonis/Core/Route'
import AssetTypes from 'App/Enums/AssetTypes'

export default class Post extends AppBaseModel {
  public serializeExtras = true

  @column({ isPrimary: true })
  public id: number

  @column()
  public title: string

  @column()
  @slugify({
    strategy: 'dbIncrement',
    fields: ['title']
  })
  public slug: string

  @column()
  public pageTitle: string | null

  @column()
  public description: string | null

  @column()
  public metaDescription: string | null

  @column()
  public canonical: string | null

  @column()
  public body: string | null

  @column()
  public bodyBlocks: object | string | null

  @column()
  public bodyTypeId: number

  @column()
  public videoUrl: string | null

  @column()
  public livestreamUrl: string | null

  @column()
  public isFeatured: boolean | null

  @column()
  public isPersonal: boolean | null

  @column()
  public isLive: boolean | null

  @column()
  public viewCount: number | null

  @column()
  public viewCountUnique: number | null

  @column()
  public stateId: State

  @column()
  public readMinutes: number

  @column()
  public readTime: number

  @column()
  public wordCount: number

  @column()
  public videoSeconds: number

  @column()
  public postTypeId: number

  @column()
  public redirectUrl: string

  @column()
  public repositoryUrl: string

  @column()
  public timezone: string | null

  @column()
  public publishAtUser: string | null

  @column.dateTime()
  public publishAt: DateTime | null

  @column.dateTime({ autoCreate: true })
  public createdAt: DateTime

  @column.dateTime({ autoCreate: true, autoUpdate: true })
  public updatedAt: DateTime

  @manyToMany(() => Asset, {
    pivotTable: 'asset_posts',
    pivotColumns: ['sort_order']
  })
  public assets: ManyToMany<typeof Asset>

  @hasMany(() => PostSnapshot)
  public snapshots: HasMany<typeof PostSnapshot>

  @hasMany(() => Comment)
  public comments: HasMany<typeof Comment>

  @manyToMany(() => User, {
    pivotTable: 'author_posts',
    pivotColumns: ['author_type_id']
  })
  public authors: ManyToMany<typeof User>

  @manyToMany(() => Taxonomy, {
    pivotTable: 'post_taxonomies',
    pivotColumns: ['sort_order']
  })
  public taxonomies: ManyToMany<typeof Taxonomy>

  @manyToMany(() => Collection, {
    onQuery(query) {
      query.where('collectionTypeId', CollectionTypes.SERIES)
    },
    pivotColumns: ['sort_order', 'root_collection_id', 'root_sort_order']
  })
  public series: ManyToMany<typeof Collection>

  @manyToMany(() => Collection, {
    onQuery(query) {
      query.where('collectionTypeId', CollectionTypes.SERIES)
    },
    pivotRelatedForeignKey: 'root_collection_id',
    pivotColumns: ['sort_order', 'root_collection_id', 'root_sort_order']
  })
  public rootSeries: ManyToMany<typeof Collection>

  @manyToMany(() => Collection, {
    onQuery(query) {
      query.where('collectionTypeId', CollectionTypes.COURSE)
    },
    pivotColumns: ['sort_order', 'root_collection_id', 'root_sort_order']
  })
  public courses: ManyToMany<typeof Collection>

  @manyToMany(() => Collection, {
    onQuery(query) {
      query.where('collectionTypeId', CollectionTypes.PLAYLIST)
    },
    pivotColumns: ['sort_order', 'root_collection_id', 'root_sort_order']
  })
  public playlists: ManyToMany<typeof Collection>

  @manyToMany(() => Collection, {
    pivotColumns: ['sort_order', 'root_collection_id', 'root_sort_order']
  })
  public collections: ManyToMany<typeof Collection>

  @hasMany(() => History, {
    onQuery: q => q.where('historyTypeId', HistoryTypes.VIEW)
  })
  public viewHistory: HasMany<typeof History>

  @hasMany(() => History, {
    onQuery: q => q.where('historyTypeId', HistoryTypes.PROGRESSION)
  })
  public progressionHistory: HasMany<typeof History>

  @hasMany(() => Watchlist)
  public watchlist: HasMany<typeof Watchlist>

  @computed()
  public get publishAtDateString() {
    let dte = this.publishAt

    if (dte && this.timezone) {
      dte = DateTime.now()
      dte = dte.set(this.publishAt!.toObject()).setZone(this.timezone)
    }

    return dte?.toFormat('yyyy-MM-dd')
  }

  @computed()
  public get publishAtTimeString() {
    let dte = this.publishAt

    if (dte && this.timezone) {
      dte = DateTime.now()
      dte = dte.set(this.publishAt!.toObject()).setZone(this.timezone)
    }

    return dte?.toFormat('HH:mm')
  }

  @computed()
  public get isPublished(): boolean {
    const isPublic = this.stateId === State.PUBLIC

    if (!this.publishAt) {
      return isPublic
    }

    const isPastPublishAt = this.publishAt.diffNow().as('seconds')

    return isPublic && isPastPublishAt < 0
  }

  @computed()
  public get isViewable(): boolean {
    const isPublicOrUnlisted = this.stateId === State.PUBLIC || this.stateId === State.UNLISTED;

    if (!this.publishAt) {
      return isPublicOrUnlisted
    }

    const isPastPublishAt = this.publishAt.diffNow().as('seconds')

    return isPublicOrUnlisted && isPastPublishAt < 0
  }

  @computed()
  public get isNotViewable() {
    return this.stateId !== State.PUBLIC && this.stateId !== State.UNLISTED;
  }

  @computed()
  public get rootSortOrder() {
    if (!this.series || !this.series.length) {
      return undefined
    }

    return this.series[0].$extras.pivot_root_sort_order
  }

  @computed()
  public get videoId() {
    if (!this.videoUrl) return '';

    return this.videoUrl
      .replace('https://www.', 'https://')
      .replace('https://youtube.com/watch?v=', '')
      .replace('https://youtube.com/embed/', '')
      .replace('https://youtu.be/', '');
  }

  @computed()
  public get streamId() {
    if (!this.livestreamUrl) return '';

    return this.livestreamUrl
      .replace('https://www.', 'https://')
      .replace('https://youtube.com/watch?v=', '')
      .replace('https://youtube.com/embed/', '')
      .replace('https://youtu.be/', '');
  }

  @computed()
  public get isInWatchlist() {
    if (!this.$extras.watchlist_count) {
      return false
    }

    return Number(this.$extras.watchlist_count) > 0
  }

  @computed()
  public get timeago() {
    return this.publishAt ? timeago.format(this.publishAt.toJSDate()) : ''
  }

  @computed()
  public get watchMinutes() {
    if (!this.videoSeconds) return 0
    const hours = Math.floor(this.videoSeconds / 3600)
    const time = this.videoSeconds - hours * 3600
    const minutes = Math.floor(time / 60)
    const seconds = time - minutes * 60
    const minutesDisplay = minutes < 10 ? "0" + minutes : minutes
    const secondsDisplay = seconds < 10 ? "0" + seconds : seconds
    return hours ? `${hours}:${minutesDisplay}:${secondsDisplay}` : `${minutesDisplay}:${secondsDisplay}`
  }

  @computed()
  public get readMinutesDisplay() {
    if (!this.readTime) return 0
    const minutes = Math.floor(this.readTime / 60000);
    const seconds = ((this.readTime % 60000) / 1000).toFixed(0);
    return `${minutes}:${(parseInt(seconds) < 10 ? "0" : "")}${seconds}`;
  }

  @computed()
  public get routeUrl() {
    if (this.redirectUrl) return this.redirectUrl

    switch (this.postTypeId) {
      case PostType.BLOG:
        return Route.makeUrl('posts.show', { slug: this.slug })
      case PostType.NEWS:
        return Route.makeUrl('news.show', { slug: this.slug })
      case PostType.LIVESTREAM:
        return Route.makeUrl('livestreams.show', { slug: this.slug })
      default:
        return Route.makeUrl('lessons.show', { slug: this.slug })
    }
  }

  @beforeSave()
  public static async setReadTimeValues(post: Post) {
    if (post.$dirty.bodyBlocks) {
      post.bodyTypeId = BodyTypes.JSON
      await EditorBlockParser.parse(post)
    } else if (post.$dirty.body) {
      post.bodyTypeId = BodyTypes.HTML
    }

    const readTime = ReadService.getReadCounts(post.body)
    post.readMinutes = readTime.minutes
    post.readTime = readTime.time
    post.wordCount = readTime.words
  }

  @computed()
  public get lessonIndexDisplay() {
    const series = this.series?.length && this.series[0]

    if (!series) {
      return ''
    }

    if (!series.parentId) {
      return `${series.$extras.pivot_sort_order + 1}.0`
    }

    return `${series.sortOrder + 1}.${series.$extras.pivot_sort_order}`
  }

  public getIndexDisplay(series: Collection | undefined) {
    const postSeries = this.series?.find(s => s.id === series?.id)

    if (!postSeries) return ''

    if (!postSeries.parentId) {
      return `${postSeries.$extras.pivot_sort_order + 1}.0`
    }

    return `${postSeries.sortOrder + 1}.${postSeries.$extras.pivot_sort_order}`
  }

  public static lessons() {
    return this.query().where('postTypeId', PostType.LESSON)
  }

  public static blogs() {
    return this.query().where('postTypeId', PostType.BLOG)
  }

  public static news() {
    return this.query().where('postTypeId', PostType.NEWS)
  }

  public static livestreams() {
    return this.query().where('postTypeId', PostType.LIVESTREAM)
  }

  public static links() {
    return this.query().where('postTypeId', PostType.LINK)
  }

  public static loadForDisplay() {
    return this.query().apply(scope => scope.forDisplay())
  }

  public static published = scope<typeof Post>((query) => {
    query
      .where('stateId', States.PUBLIC)
      .where('publishAt', '<=', DateTime.now().toSQL())
  })

  public static forDisplay = scope<typeof Post>((query, skipPublishCheck: boolean = false) => {
    query
      .if(!skipPublishCheck, query => query.apply(scope => scope.published()))
      .preload('assets', q => q.where('assetTypeId', AssetTypes.THUMBNAIL))
      .preload('taxonomies')
      .preload('rootSeries')
      .preload('series')
      .preload('authors', query => query.preload('profile'))
  })

  public static forCollectionDisplay = scope<typeof Post>((query, { orderBy, direction }: { orderBy: 'pivot_sort_order'|'pivot_root_sort_order', direction: 'asc'|'desc' } = { orderBy: 'pivot_sort_order', direction: 'asc' }) => {
    query
      .apply(scope => scope.forDisplay())
      .orderBy(orderBy, direction)
  })
}
