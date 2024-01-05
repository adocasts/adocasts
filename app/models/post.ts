import { DateTime } from 'luxon'
import {
  beforeSave,
  column,
  computed,
  hasMany,
  manyToMany, scope
} from '@adonisjs/lucid/orm'
import type { HasMany, ManyToMany } from '@adonisjs/lucid/types/relations'
import Asset from '#models/asset'
import PostSnapshot from '#models/post_snapshot'
import User from '#models/user'
import Comment from '#models/comment'
// import { slugify } from '@ioc:Adonis/Addons/LucidSlugify'
import State from '#enums/states'
import Taxonomy from "#models/taxonomy"
import ReadService from '#services/read_service'
import BodyTypes from '#enums/body_types'
import PostType from '#enums/post_types'
import AppBaseModel from '#models/app_base_model'
import States from '#enums/states'
import Collection from '#models/collection'
import CollectionTypes from '#enums/collection_types'
import Watchlist from '#models/watchlist'
import History from '#models/history'
import HistoryTypes from '#enums/history_types'
import AssetTypes from '#enums/asset_types'
import PaywallTypes from '#enums/paywall_types'
import VideoTypes from '#enums/video_types'
import UtilityService from '#services/utility_service'
import { ModelQueryBuilderContract } from '@adonisjs/lucid/types/model'
import SlugService from '#services/slug_service'
import router from '@adonisjs/core/services/router'

export default class Post extends AppBaseModel {
  public serializeExtras = true

  @column({ isPrimary: true })
  declare id: number

  @column()
  declare title: string

  @column()
  // @slugify({
  //   strategy: 'dbIncrement',
  //   fields: ['title']
  // })
  declare slug: string

  @column()
  declare pageTitle: string | null

  @column()
  declare description: string | null

  @column()
  declare metaDescription: string | null

  @column()
  declare canonical: string | null

  @column()
  declare body: string | null
  public bodyDisplay: string = ''

  @column()
  declare bodyBlocks: object | string | null

  @column()
  declare bodyTypeId: number

  @column()
  declare videoTypeId: VideoTypes | null

  @column()
  declare videoUrl: string | null

  @column()
  declare videoBunnyId: string | null

  @column()
  declare livestreamUrl: string | null

  @column()
  declare isFeatured: boolean | null

  @column()
  declare isPersonal: boolean | null

  @column()
  declare isLive: boolean | null

  @column()
  declare viewCount: number | null

  @column()
  declare viewCountUnique: number | null

  @column()
  declare stateId: State

  @column()
  declare paywallTypeId: PaywallTypes

  @column()
  declare readMinutes: number

  @column()
  declare readTime: number

  @column()
  declare wordCount: number

  @column()
  declare videoSeconds: number

  @column()
  declare postTypeId: number

  @column()
  declare redirectUrl: string

  @column()
  declare repositoryUrl: string

  @column()
  declare timezone: string | null

  @column()
  declare publishAtUser: string | null

  @column.dateTime()
  declare publishAt: DateTime | null

  @column.dateTime({ autoCreate: true })
  declare createdAt: DateTime

  @column.dateTime({ autoCreate: true, autoUpdate: true })
  declare updatedAt: DateTime

  @manyToMany(() => Asset, {
    pivotTable: 'asset_posts',
    pivotColumns: ['sort_order']
  })
  declare assets: ManyToMany<typeof Asset>

  @manyToMany(() => Asset, {
    pivotTable: 'asset_posts',
    pivotColumns: ['sort_order'],
    onQuery: q => q.where('assetTypeId', AssetTypes.THUMBNAIL)
  })
  declare thumbnails: ManyToMany<typeof Asset>

  @manyToMany(() => Asset, {
    pivotTable: 'asset_posts',
    pivotColumns: ['sort_order'],
    onQuery: q => q.where('assetTypeId', AssetTypes.COVER)
  })
  declare covers: ManyToMany<typeof Asset>

  @hasMany(() => PostSnapshot)
  declare snapshots: HasMany<typeof PostSnapshot>

  @hasMany(() => Comment)
  declare comments: HasMany<typeof Comment>

  @manyToMany(() => User, {
    pivotTable: 'author_posts',
    pivotColumns: ['author_type_id']
  })
  declare authors: ManyToMany<typeof User>

  @manyToMany(() => Taxonomy, {
    pivotTable: 'post_taxonomies',
    pivotColumns: ['sort_order']
  })
  declare taxonomies: ManyToMany<typeof Taxonomy>

  @manyToMany(() => Collection, {
    onQuery(query) {
      query.where('collectionTypeId', CollectionTypes.SERIES)
    },
    pivotColumns: ['sort_order', 'root_collection_id', 'root_sort_order']
  })
  declare series: ManyToMany<typeof Collection>

  @manyToMany(() => Collection, {
    onQuery(query) {
      query.where('collectionTypeId', CollectionTypes.SERIES)
    },
    pivotRelatedForeignKey: 'root_collection_id',
    pivotColumns: ['sort_order', 'root_collection_id', 'root_sort_order']
  })
  declare rootSeries: ManyToMany<typeof Collection>

  @manyToMany(() => Collection, {
    onQuery(query) {
      query.where('collectionTypeId', CollectionTypes.PATH)
    },
    pivotRelatedForeignKey: 'root_collection_id',
    pivotColumns: ['sort_order', 'root_collection_id', 'root_sort_order']
  })
  declare rootPaths: ManyToMany<typeof Collection>

  @manyToMany(() => Collection, {
    onQuery(query) {
      query.where('collectionTypeId', CollectionTypes.COURSE)
    },
    pivotColumns: ['sort_order', 'root_collection_id', 'root_sort_order']
  })
  declare courses: ManyToMany<typeof Collection>

  @manyToMany(() => Collection, {
    onQuery(query) {
      query.where('collectionTypeId', CollectionTypes.PLAYLIST)
    },
    pivotColumns: ['sort_order', 'root_collection_id', 'root_sort_order']
  })
  declare playlists: ManyToMany<typeof Collection>

  @manyToMany(() => Collection, {
    onQuery(query) {
      query.where('collectionTypeId', CollectionTypes.PATH)
    },
    pivotColumns: ['sort_order', 'root_collection_id', 'root_sort_order']
  })
  declare paths: ManyToMany<typeof Collection>

  @manyToMany(() => Collection, {
    pivotColumns: ['sort_order', 'root_collection_id', 'root_sort_order']
  })
  declare collections: ManyToMany<typeof Collection>

  @hasMany(() => History, {
    onQuery: q => q.where('historyTypeId', HistoryTypes.VIEW)
  })
  declare viewHistory: HasMany<typeof History>

  @hasMany(() => History, {
    onQuery: q => q.where('historyTypeId', HistoryTypes.PROGRESSION)
  })
  declare progressionHistory: HasMany<typeof History>

  @hasMany(() => Watchlist)
  declare watchlist: HasMany<typeof Watchlist>

  @computed()
  public get publishAtDisplay() {
    if (!this.publishAt) return ''

    if (DateTime.now().year === this.publishAt.year) {
      return this.publishAt.toFormat('MMM dd')
    }

    return this.publishAt.toFormat('MMM dd, yy')
  }

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
    const isdeclare = this.stateId === State.PUBLIC

    if (!this.publishAt) {
      return isdeclare
    }

    const isPastPublishAt = this.publishAt.diffNow().as('seconds')

    return isdeclare && isPastPublishAt < 0
  }

  @computed()
  public get isViewable(): boolean {
    const isdeclareOrUnlisted = this.stateId === State.PUBLIC || this.stateId === State.UNLISTED;

    if (!this.publishAt) {
      return isdeclareOrUnlisted
    }

    const isPastPublishAt = this.publishAt.diffNow().as('seconds')

    return isdeclareOrUnlisted && isPastPublishAt < 0
  }

  @computed()
  public get isNotViewable() {
    return this.stateId !== State.PUBLIC && this.stateId !== State.UNLISTED;
  }

  @computed()
  public get paywallDaysRemaining() {
    const { days } = this.publishAt!.plus({ days: 14 }).diffNow('days')
    return days
  }

  @computed()
  public get paywallTimeAgo() {
    if (!this.publishAt) return
    return UtilityService.timeago(this.publishAt.plus({ days: 14 }))
  }

  @computed()
  public get isPaywalled() {
    if (this.paywallTypeId === PaywallTypes.NONE) return false
    if (this.paywallTypeId === PaywallTypes.FULL) return true
    
    return this.paywallDaysRemaining > 0
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
    if (this.videoTypeId === VideoTypes.BUNNY) {
      return this.videoBunnyId
    }

    if (!this.videoUrl) return '';

    return this.videoUrl
      .replace('https://www.', 'https://')
      .replace('https://youtube.com/watch?v=', '')
      .replace('https://youtube.com/embed/', '')
      .replace('https://youtu.be/', '');
  }

  @computed()
  public get bunnyHlsUrl() {
    if (this.videoTypeId !== VideoTypes.BUNNY) return

    return `https://videos.adocasts.com/${this.videoBunnyId}/playlist.m3u8`
  }

  @computed()
  public get bunnyFallbackUrls() {
    if (this.videoTypeId !== VideoTypes.BUNNY) return
    
    // note: bunny stream only provides direct mp4 files up to 720p
    // but that's okay because these are fallbacks in the event hls isn't support by the user
    const baseUrl = `https://videos.adocasts.com/${this.videoBunnyId}`
    const heights = ['480', '720']

    return heights.map(height => ({ height, src: `${baseUrl}/play_${height}p.mp4` }))
  }

  @computed()
  public get bunnySubtitleUrls() {
    if (this.videoTypeId !== VideoTypes.BUNNY) return

    const langs = [{ label: 'English', code: 'en' }]

    return langs.map(lang => ({
      ...lang,
      src: `https://videos.adocasts.com/${this.videoBunnyId}/captions/${lang.code}.vtt`
    }))
  }

  @computed()
  public get transcriptUrl() {
    if (this.videoTypeId !== VideoTypes.BUNNY) return

    return this.bunnySubtitleUrls?.at(0)?.src
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
  public get hasVideo() {
    return this.videoUrl || this.livestreamUrl || this.videoBunnyId
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
    return UtilityService.timeago(this.publishAt)
  }

  @computed()
  public get watchMinutes() {
    if (!this.videoSeconds) return 0
    return UtilityService.secondsToTimestring(this.videoSeconds)
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

    let namePrefix = ''
    let params: { collectionSlug?: string, slug: string } = { slug: this.slug }
    
    if (typeof this.$extras.pivot_sort_order != undefined && (this.rootSeries?.length || this.rootPaths?.length)) {
      const series = this.rootPaths?.length ? this.rootPaths.at(0) : this.rootSeries.at(0)
      
      switch (series?.collectionTypeId) {
        case CollectionTypes.SERIES:
          namePrefix = 'series.'
          params.collectionSlug = series.slug
          break
        case CollectionTypes.PATH:
          namePrefix = 'paths.'
          params.collectionSlug = series.slug
          break
      }
    }

    const builder = router.builder().disableRouteLookup().params(params)

    switch (this.postTypeId) {
      case PostType.BLOG:
        return builder.make('/blog/:slug')
      case PostType.NEWS:
        return builder.make('/news/:slug')
      case PostType.SNIPPET:
        return builder.make('/snippets/:slug')
      case PostType.LIVESTREAM:
        return params.collectionSlug
          ? builder.make('/series/:collectionSlug/streams/:slug')
          : builder.make('/streams/:slug')
      default:
        return params.collectionSlug
          ? builder.make('/series/:collectionSlug/lessons/:slug')
          : builder.make('/lessons/:slug')
    }
  }

  @beforeSave()
  public static async slugifySlug(post: Post) {
    if (post.$dirty.title && !post.$dirty.slug && !post.slug) {
      const slugify = new SlugService<typeof Post>({ strategy: 'dbIncrement', fields: ['title'] })
      post.slug = await slugify.make(Post, 'title', post.title)
    }
  }

  @beforeSave()
  public static async setReadTimeValues(post: Post) {
    if (post.$dirty.bodyBlocks) {
      // post.bodyTypeId = BodyTypes.JSON
      // await EditorBlockParser.parse(post)
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
    const path = this.rootPaths?.length && this.paths[0]
    const series = this.series?.length && this.series[0]
    
    if (path) {
      return !path.parentId
        ? `${path.$extras.pivot_sort_order + 1}.0`
        : `${path.sortOrder + 1}.${path.$extras.pivot_sort_order}`
    }

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

  public static snippets() {
    return this.query().where('postTypeId', PostType.SNIPPET)
  }

  public static loadForDisplay() {
    return this.query().apply(scope => scope.forDisplay())
  }

  public static progression = scope<typeof Post, (query: ModelQueryBuilderContract<typeof Post>) => void>((query, user: User | undefined = undefined) => {
    query
      .if(user, query => query
        .preload('progressionHistory', query => query
          .where({ userId: user!.id })
          .orderBy('updated_at', 'desc')
          .first()
        )
      )
  })

  public static published = scope((query) => {
    query
      .where('stateId', States.PUBLIC)
      .where('publishAt', '<=', DateTime.now().toSQL()!)
  })

  public static publishedPublic = scope<typeof Post, (query: ModelQueryBuilderContract<typeof Post>) => void>((query) => {
    query
      .where('stateId', States.PUBLIC)
      .where(query => query
        .where('paywallTypeId', PaywallTypes.DELAYED_RELEASE)
        .where('publishAt', '<=', DateTime.now().minus({ days: 14 }).toSQL()!)
        .orWhere('paywallTypeId', PaywallTypes.NONE)
      )
  })

  public static forDisplay = scope<typeof Post, (query: ModelQueryBuilderContract<typeof Post>) => void>((query) => {
    // const ctx = HttpContext.get()

    query
      // .if(ctx?.auth.user, query => query.withCount('watchlist', query => query.where('userId', ctx!.auth.user!.id)))
      .preload('thumbnails')
      .preload('covers')
      .preload('taxonomies')
      .preload('rootSeries')
      .preload('series')
      .preload('authors', query => query.preload('profile'))
  })

  public static forPathDisplay = scope<typeof Post, (query: ModelQueryBuilderContract<typeof Post>) => void>((query, skipPublishCheck: boolean = false) => {
    // const ctx = HttpContext.get()

    query
      .if(!skipPublishCheck, query => query.apply(scope => scope.published()))
      // .if(ctx?.auth.user, query => query.withCount('watchlist', query => query.where('userId', ctx!.auth.user!.id)))
      .preload('thumbnails')
      .preload('covers')
      .preload('taxonomies')
      .preload('rootPaths')
      .preload('paths')
      .preload('authors', query => query.preload('profile'))
  })

  public static forCollectionDisplay = scope<typeof Post, (query: ModelQueryBuilderContract<typeof Post>) => void>((query, { orderBy, direction }: { orderBy: 'pivot_sort_order' | 'pivot_root_sort_order', direction: 'asc' | 'desc' } = { orderBy: 'pivot_sort_order', direction: 'asc' }) => {
    query
      .apply(scope => scope.forDisplay())
      .orderBy(orderBy, direction)
  })

  public static forCollectionPathDisplay = scope<typeof Post, (query: ModelQueryBuilderContract<typeof Post>) => void>((query, { orderBy, direction }: { orderBy: 'pivot_sort_order' | 'pivot_root_sort_order', direction: 'asc' | 'desc' } = { orderBy: 'pivot_sort_order', direction: 'asc' }) => {
    query
      .apply(scope => scope.forPathDisplay())
      .orderBy(orderBy, direction)
  })
}
