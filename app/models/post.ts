import { DateTime } from 'luxon'
import { beforeSave, column, computed, hasMany, manyToMany, scope } from '@adonisjs/lucid/orm'
import type { HasMany, ManyToMany } from '@adonisjs/lucid/types/relations'
import Asset from '#models/asset'
import PostSnapshot from '#models/post_snapshot'
import User from '#models/user'
import Comment from '#models/comment'
// import { slugify } from '@ioc:Adonis/Addons/LucidSlugify'
import State from '#enums/states'
import Taxonomy from '#models/taxonomy'
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
import Progress from './progress.js'
import PostTypes from '#enums/post_types'

export default class Post extends AppBaseModel {
  serializeExtras = true

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
  bodyDisplay: string = ''

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
  declare postTypeId: PostTypes

  @column()
  declare redirectUrl: string

  @column()
  declare repositoryUrl: string

  @column()
  declare isWatchlistSent: boolean

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
    pivotColumns: ['sort_order'],
  })
  declare assets: ManyToMany<typeof Asset>

  @manyToMany(() => Asset, {
    pivotTable: 'asset_posts',
    pivotColumns: ['sort_order'],
    onQuery: (q) => q.where('assetTypeId', AssetTypes.THUMBNAIL),
  })
  declare thumbnails: ManyToMany<typeof Asset>

  @manyToMany(() => Asset, {
    pivotTable: 'asset_posts',
    pivotColumns: ['sort_order'],
    onQuery: (q) => q.where('assetTypeId', AssetTypes.COVER),
  })
  declare covers: ManyToMany<typeof Asset>

  @hasMany(() => PostSnapshot)
  declare snapshots: HasMany<typeof PostSnapshot>

  @hasMany(() => Comment)
  declare comments: HasMany<typeof Comment>

  @manyToMany(() => User, {
    pivotTable: 'author_posts',
    pivotColumns: ['author_type_id'],
  })
  declare authors: ManyToMany<typeof User>

  @manyToMany(() => Taxonomy, {
    pivotTable: 'post_taxonomies',
    pivotColumns: ['sort_order'],
  })
  declare taxonomies: ManyToMany<typeof Taxonomy>

  @manyToMany(() => Collection, {
    onQuery(query) {
      query.where('collectionTypeId', CollectionTypes.SERIES)
    },
    pivotColumns: ['sort_order', 'root_collection_id', 'root_sort_order'],
  })
  declare series: ManyToMany<typeof Collection>

  @manyToMany(() => Collection, {
    onQuery(query) {
      query.where('collectionTypeId', CollectionTypes.SERIES)
    },
    pivotRelatedForeignKey: 'root_collection_id',
    pivotColumns: ['sort_order', 'root_collection_id', 'root_sort_order'],
  })
  declare rootSeries: ManyToMany<typeof Collection>

  @manyToMany(() => Collection, {
    onQuery(query) {
      query.where('collectionTypeId', CollectionTypes.PATH)
    },
    pivotRelatedForeignKey: 'root_collection_id',
    pivotColumns: ['sort_order', 'root_collection_id', 'root_sort_order'],
  })
  declare rootPaths: ManyToMany<typeof Collection>

  @manyToMany(() => Collection, {
    onQuery(query) {
      query.where('collectionTypeId', CollectionTypes.COURSE)
    },
    pivotColumns: ['sort_order', 'root_collection_id', 'root_sort_order'],
  })
  declare courses: ManyToMany<typeof Collection>

  @manyToMany(() => Collection, {
    onQuery(query) {
      query.where('collectionTypeId', CollectionTypes.PLAYLIST)
    },
    pivotColumns: ['sort_order', 'root_collection_id', 'root_sort_order'],
  })
  declare playlists: ManyToMany<typeof Collection>

  @manyToMany(() => Collection, {
    onQuery(query) {
      query.where('collectionTypeId', CollectionTypes.PATH)
    },
    pivotColumns: ['sort_order', 'root_collection_id', 'root_sort_order'],
  })
  declare paths: ManyToMany<typeof Collection>

  @manyToMany(() => Collection, {
    pivotColumns: ['sort_order', 'root_collection_id', 'root_sort_order'],
  })
  declare collections: ManyToMany<typeof Collection>

  @hasMany(() => History, {
    onQuery: (q) => q.where('historyTypeId', HistoryTypes.VIEW),
  })
  declare viewHistory: HasMany<typeof History>

  @hasMany(() => Progress)
  declare progressionHistory: HasMany<typeof Progress>

  @hasMany(() => Watchlist)
  declare watchlist: HasMany<typeof Watchlist>

  @computed()
  get publishAtISO() {
    if (!this.publishAt) return ''
    return this.publishAt.toISO()
  }

  @computed()
  get publishAtDisplay() {
    if (!this.publishAt) return ''

    if (DateTime.now().year === this.publishAt.year) {
      return this.publishAt.toFormat('MMM dd')
    }

    return this.publishAt.toFormat('MMM dd, yy')
  }

  @computed()
  get rootSortOrder() {
    if (!this.series || !this.series.length) {
      return undefined
    }

    return this.series[0].$extras.pivot_root_sort_order
  }

  @computed()
  get videoYouTubeId() {
    if (!this.videoUrl) return ''

    return this.videoUrl
      .replace('https://www.', 'https://')
      .replace('https://youtube.com/watch?v=', '')
      .replace('https://youtube.com/embed/', '')
      .replace('https://youtu.be/', '')
  }

  @computed()
  get videoId() {
    if (this.videoTypeId === VideoTypes.BUNNY) {
      return this.videoBunnyId
    }

    return this.videoYouTubeId
  }

  @computed()
  get bunnyHlsUrl() {
    if (this.videoTypeId !== VideoTypes.BUNNY) return

    return `https://videos.adocasts.com/${this.videoBunnyId}/playlist.m3u8`
  }

  @computed()
  get bunnyFallbackUrls() {
    if (this.videoTypeId !== VideoTypes.BUNNY) return

    // note: bunny stream only provides direct mp4 files up to 720p
    // but that's okay because these are fallbacks in the event hls isn't support by the user
    const baseUrl = `https://videos.adocasts.com/${this.videoBunnyId}`
    const heights = ['480', '720']

    return heights.map((height) => ({ height, src: `${baseUrl}/play_${height}p.mp4` }))
  }

  @computed()
  get bunnySubtitleUrls() {
    if (this.videoTypeId !== VideoTypes.BUNNY) return

    const langs = [{ label: 'English', code: 'en' }]

    return langs.map((lang) => ({
      ...lang,
      src: `https://videos.adocasts.com/${this.videoBunnyId}/captions/${lang.code}.vtt`,
    }))
  }

  @computed()
  get transcriptUrl() {
    if (this.videoTypeId !== VideoTypes.BUNNY || !this.videoBunnyId) return

    return this.bunnySubtitleUrls?.at(0)?.src
  }

  @computed()
  get animatedPreviewUrl() {
    if (this.videoTypeId !== VideoTypes.BUNNY || !this.videoBunnyId) return

    return `https://videos.adocasts.com/${this.videoBunnyId}/preview.webp`
  }

  @computed()
  get streamId() {
    if (!this.livestreamUrl) return ''

    return this.livestreamUrl
      .replace('https://www.', 'https://')
      .replace('https://youtube.com/watch?v=', '')
      .replace('https://youtube.com/embed/', '')
      .replace('https://youtu.be/', '')
  }

  @computed()
  get hasVideo() {
    return this.videoUrl || this.livestreamUrl || this.videoBunnyId
  }

  @computed()
  get watchMinutes() {
    if (!this.videoSeconds) return 0
    return UtilityService.secondsToTimestring(this.videoSeconds)
  }

  @computed()
  get readMinutesDisplay() {
    if (!this.readTime) return 0
    const minutes = Math.floor(this.readTime / 60000)
    const seconds = ((this.readTime % 60000) / 1000).toFixed(0)
    return `${minutes}:${Number.parseInt(seconds) < 10 ? '0' : ''}${seconds}`
  }

  @computed()
  get routeUrl() {
    if (this.redirectUrl) return this.redirectUrl

    let params: { collectionSlug?: string; slug: string } = { slug: this.slug }

    if (
      typeof this.$extras.pivot_sort_order !== 'undefined' &&
      (this.rootSeries?.length || this.rootPaths?.length)
    ) {
      const series = this.rootPaths?.length ? this.rootPaths.at(0) : this.rootSeries.at(0)

      switch (series?.collectionTypeId) {
        case CollectionTypes.SERIES:
          params.collectionSlug = series.slug
          break
        case CollectionTypes.PATH:
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
  static async slugifySlug(post: Post) {
    if (post.$dirty.title && !post.$dirty.slug && !post.slug) {
      const slugify = new SlugService<typeof Post>({ strategy: 'dbIncrement', fields: ['title'] })
      post.slug = await slugify.make(Post, 'title', post.title)
    }
  }

  @beforeSave()
  static async setReadTimeValues(post: Post) {
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
  get lessonIndexDisplay() {
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

  getIndexDisplay(series: Collection | undefined) {
    const postSeries = this.series?.find((s) => s.id === series?.id)

    if (!postSeries) return ''

    if (!postSeries.parentId) {
      return `${postSeries.$extras.pivot_sort_order + 1}.0`
    }

    return `${postSeries.sortOrder + 1}.${postSeries.$extras.pivot_sort_order}`
  }

  static lessons() {
    return this.query().where('postTypeId', PostType.LESSON)
  }

  static blogs() {
    return this.query().where('postTypeId', PostType.BLOG)
  }

  static news() {
    return this.query().where('postTypeId', PostType.NEWS)
  }

  static livestreams() {
    return this.query().where('postTypeId', PostType.LIVESTREAM)
  }

  static links() {
    return this.query().where('postTypeId', PostType.LINK)
  }

  static snippets() {
    return this.query().where('postTypeId', PostType.SNIPPET)
  }

  static loadForDisplay() {
    return this.query().apply((s) => s.forDisplay())
  }

  static progression = scope<typeof Post, (query: ModelQueryBuilderContract<typeof Post>) => void>(
    (query, user: User | undefined = undefined) => {
      query.if(user, (truthy) =>
        truthy.preload('progressionHistory', (history) =>
          history.where({ userId: user!.id }).orderBy('updated_at', 'desc').first()
        )
      )
    }
  )

  static published = scope((query) => {
    query.where('stateId', States.PUBLIC).where('publishAt', '<=', DateTime.now().toSQL()!)
  })

  static publishedPublic = scope<
    typeof Post,
    (query: ModelQueryBuilderContract<typeof Post>) => void
  >((query) => {
    query.where('stateId', States.PUBLIC).where((and) =>
      and
        .where('paywallTypeId', PaywallTypes.DELAYED_RELEASE)
        .where('publishAt', '<=', DateTime.now().minus({ days: 14 }).toSQL()!)
        .orWhere('paywallTypeId', PaywallTypes.NONE)
    )
  })

  static forDisplay = scope<typeof Post, (query: ModelQueryBuilderContract<typeof Post>) => void>(
    (query) => {
      // const ctx = HttpContext.get()

      query
        // .if(ctx?.auth.user, query => query.withCount('watchlist', query => query.where('userId', ctx!.auth.user!.id)))
        .preload('thumbnails')
        .preload('covers')
        .preload('taxonomies')
        .preload('rootSeries')
        .preload('series')
        .preload('authors', (authors) => authors.preload('profile'))
    }
  )

  static forPathDisplay = scope<
    typeof Post,
    (query: ModelQueryBuilderContract<typeof Post>) => void
  >((query, skipPublishCheck: boolean = false) => {
    // const ctx = HttpContext.get()

    query
      .if(!skipPublishCheck, (truthy) => truthy.apply((s) => s.published()))
      // .if(ctx?.auth.user, query => query.withCount('watchlist', query => query.where('userId', ctx!.auth.user!.id)))
      .preload('thumbnails')
      .preload('covers')
      .preload('taxonomies')
      .preload('rootPaths')
      .preload('paths')
      .preload('authors', (authors) => authors.preload('profile'))
  })

  static forCollectionDisplay = scope<
    typeof Post,
    (query: ModelQueryBuilderContract<typeof Post>) => void
  >(
    (
      query,
      {
        orderBy,
        direction,
      }: { orderBy: 'pivot_sort_order' | 'pivot_root_sort_order'; direction: 'asc' | 'desc' } = {
        orderBy: 'pivot_sort_order',
        direction: 'asc',
      }
    ) => {
      query.apply((s) => s.forDisplay()).orderBy(orderBy, direction)
    }
  )

  static forCollectionPathDisplay = scope<
    typeof Post,
    (query: ModelQueryBuilderContract<typeof Post>) => void
  >(
    (
      query,
      {
        orderBy,
        direction,
      }: { orderBy: 'pivot_sort_order' | 'pivot_root_sort_order'; direction: 'asc' | 'desc' } = {
        orderBy: 'pivot_sort_order',
        direction: 'asc',
      }
    ) => {
      query.apply((s) => s.forPathDisplay()).orderBy(orderBy, direction)
    }
  )
}
