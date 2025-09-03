import Asset from '#models/asset'
import Comment from '#models/comment'
import PostSnapshot from '#models/post_snapshot'
import User from '#models/user'
import {
  BaseModel,
  beforeSave,
  column,
  computed,
  hasMany,
  manyToMany,
  scope,
} from '@adonisjs/lucid/orm'
import type { HasMany, ManyToMany } from '@adonisjs/lucid/types/relations'
import { DateTime } from 'luxon'
// import { slugify } from '@ioc:Adonis/Addons/LucidSlugify'
import AssetDto from '../dtos/asset.js'
import AssetTypes from '#enums/asset_types'
import LessonSeriesDto from '#dtos/lesson_series'
import CollectionTypes from '#enums/collection_types'
import Collection from '#models/collection'
import { default as State, default as States } from '#enums/states'
import ReadService from '#services/read_service'
import SlugService from '#services/slug_service'
import TimeService from '#services/time_service'
import HistoryTypes from '#enums/history_types'
import History from '#models/history'
import PaywallTypes from '#enums/paywall_types'
import PostBuilder from '#builders/post_builder'
import CaptionDto from '../dtos/caption.js'
import ChapterDto from '../dtos/chapter.js'
import BodyTypes from '#enums/body_types'
import { default as PostType, default as PostTypes } from '#enums/post_types'
import VideoTypes from '#enums/video_types'
import PostCaption from '#models/post_caption'
import PostChapter from '#models/post_chapter'
import Progress from '#models/progress'
import env from '#start/env'
import TopicDto from '../dtos/topic.js'
import Taxonomy from '#models/taxonomy'
import AuthorDto from '../dtos/author.js'
import Watchlist from '#models/watchlist'
import router from '@adonisjs/core/services/router'
import { ModelQueryBuilderContract } from '@adonisjs/lucid/types/model'

export default class Post extends BaseModel {
  static build = () => PostBuilder.new()

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

  @column.dateTime()
  declare updatedContentAt: DateTime | null

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

  @hasMany(() => PostCaption)
  declare captions: HasMany<typeof PostCaption>

  @hasMany(() => PostChapter)
  declare chapters: HasMany<typeof PostChapter>

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
  get videoYouTubeId() {
    if (this.videoTypeId !== VideoTypes.YOUTUBE || !this.videoUrl) return ''

    return this.videoUrl
      .replace('https://www.', 'https://')
      .replace('https://youtube.com/watch?v=', '')
      .replace('https://youtube.com/embed/', '')
      .replace('https://youtu.be/', '')
  }

  @computed()
  get videoR2Id() {
    if (this.videoTypeId !== VideoTypes.R2 || !this.videoUrl) return ''
    return this.videoUrl
  }

  @computed()
  get videoId() {
    if (this.videoTypeId === VideoTypes.BUNNY) return this.videoBunnyId
    if (this.videoTypeId === VideoTypes.R2) return this.videoR2Id
    return this.videoYouTubeId
  }

  @computed()
  get bunnyHlsUrl() {
    if (this.videoTypeId !== VideoTypes.BUNNY) return

    return `${env.get('VIDEO_DOMAIN')}/${this.videoBunnyId}/playlist.m3u8`
  }

  @computed()
  get bunnyFallbackUrls() {
    if (this.videoTypeId !== VideoTypes.BUNNY) return

    // note: bunny stream only provides direct mp4 files up to 720p
    // but that's okay because these are fallbacks in the event hls isn't support by the user
    const baseUrl = `${env.get('VIDEO_DOMAIN')}/${this.videoBunnyId}`
    const heights = ['480', '720']

    return heights.map((height) => ({ height, src: `${baseUrl}/play_${height}p.mp4` }))
  }

  @computed()
  get bunnySubtitleUrls() {
    if (this.videoTypeId !== VideoTypes.BUNNY) return

    const langs = [{ label: 'English', code: 'en' }]

    return langs.map((lang) => ({
      ...lang,
      src: `${env.get('VIDEO_DOMAIN')}/${this.videoBunnyId}/captions/${lang.code}.vtt`,
    }))
  }

  @computed()
  get transcriptUrl() {
    if (this.videoTypeId === VideoTypes.R2 && this.captions?.length) {
      const filename = this.captions.at(0)?.filename
      if (!filename) return
      return `https://vid.adocasts.com/${this.videoId}/${filename}`
    }

    if (this.videoTypeId !== VideoTypes.BUNNY || !this.videoBunnyId) return

    return this.bunnySubtitleUrls?.at(0)?.src
  }

  @computed()
  get animatedPreviewUrl() {
    if (this.videoTypeId === VideoTypes.R2 && this.videoId) {
      return `https://vid.adocasts.com/${this.videoId}/video.webp`
    }

    if (this.videoTypeId !== VideoTypes.BUNNY || !this.videoBunnyId) return

    return `${env.get('VIDEO_DOMAIN')}/${this.videoBunnyId}/preview.webp`
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
    if (!this.videoSeconds) return '0m'
    return TimeService.secondsToTimestring(this.videoSeconds)
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
      post.slug = await slugify.make(Post, 'slug', post.title)
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
  get rootSortOrder() {
    if (!this.series || !this.series.length) {
      return undefined
    }

    return this.series[0].$extras.pivot_root_sort_order
  }

  @computed()
  get rootIndexDisplay() {
    if (typeof this.rootSortOrder !== 'number') return ''
    return (this.rootSortOrder + 1).toLocaleString()
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

  static forLessonDisplay = scope<
    typeof Post,
    (query: ModelQueryBuilderContract<typeof Post>) => void
  >((query) => {
    query
      .preload('thumbnails', (thumbnails) => thumbnails.selectDto(AssetDto))
      .preload('rootSeries', (series) => series.selectDto(LessonSeriesDto))
      .preload('series', (series) => series.selectDto(LessonSeriesDto))
      .preload('authors', (authors) => authors.selectDto(AuthorDto))
      .preload('taxonomies', (taxonomies) => taxonomies.selectDto(TopicDto))
  })

  static forLessonDisplayShow = scope<
    typeof Post,
    (query: ModelQueryBuilderContract<typeof Post>) => void
  >((query) => {
    query
      .preload('thumbnails', (thumbnails) => thumbnails.selectDto(AssetDto))
      .preload('rootSeries', (series) =>
        series.preload('asset', (asset) => asset.selectDto(AssetDto)).selectDto(LessonSeriesDto)
      )
      .preload('series', (series) => series.selectDto(LessonSeriesDto))
      .preload('authors', (authors) => authors.selectDto(AuthorDto))
      .preload('taxonomies', (taxonomies) => taxonomies.selectDto(TopicDto))
      .preload('captions', (captions) => captions.orderBy('sort_order').selectDto(CaptionDto))
      .preload('chapters', (chapters) => chapters.orderBy('sort_order').selectDto(ChapterDto))
  })

  static forBlogDisplay = scope<
    typeof Post,
    (query: ModelQueryBuilderContract<typeof Post>) => void
  >((query) => {
    query
      .preload('thumbnails', (thumbnails) => thumbnails.selectDto(AssetDto))
      .preload('authors', (authors) => authors.selectDto(AuthorDto))
      .preload('taxonomies', (taxonomies) => taxonomies.selectDto(TopicDto))
  })

  static forBlogDisplayShow = scope<
    typeof Post,
    (query: ModelQueryBuilderContract<typeof Post>) => void
  >((query) => {
    query
      .preload('thumbnails', (thumbnails) => thumbnails.selectDto(AssetDto))
      .preload('authors', (authors) => authors.selectDto(AuthorDto))
      .preload('taxonomies', (taxonomies) => taxonomies.selectDto(TopicDto))
      .preload('captions', (captions) => captions.orderBy('sort_order').selectDto(CaptionDto))
      .preload('chapters', (chapters) => chapters.orderBy('sort_order').selectDto(ChapterDto))
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
      query
        .preload('thumbnails', (thumbnails) => thumbnails.selectDto(AssetDto))
        .preload('rootSeries', (series) => series.selectDto(LessonSeriesDto))
        .orderBy(orderBy, direction)
    }
  )
}
