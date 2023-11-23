import { DateTime } from 'luxon'
import Hash from '@adonisjs/core/services/hash'
import { column, beforeSave, belongsTo, hasMany, hasOne, manyToMany, computed } from '@adonisjs/lucid/orm'
import type { BelongsTo, HasMany, HasOne, ManyToMany } from '@adonisjs/lucid/types/relations'
// import { slugify } from '@ioc:Adonis/Addons/LucidSlugify' // TODO
import gravatar from 'gravatar'
import Role from '#models/role'
import Profile from '#models/profile'
import Post from '#models/post'
import Collection from '#models/collection'
import Comment from '#models/comment'
import History from '#models/history'
import Notification from '#models/notification'
import LessonRequest from '#models/lesson_request'
import RequestVote from '#models/request_vote'
import Plan from '#models/plan'
import SessionLog from '#models/session_log'
import Invoice from '#models/invoice'
import AppBaseModel from '#models/app_base_model'
import Watchlist from '#models/watchlist'
import EmailHistory from '#models/email_history'
import Question from '#models/question'
import Themes from '#enums/themes'
import Roles from '#enums/roles'
import HistoryTypes from '#enums/history_types'
import Plans from '#enums/plans'
import StripeSubscriptionStatuses from '#enums/stripe_subscription_statuses'
import hash from '@adonisjs/core/services/hash'

export default class User extends AppBaseModel {
  @column({ isPrimary: true })
  declare id: number

  @column()
  declare roleId: number

  @column()
  declare planId: number

  @column()
  // @slugify({
  //   strategy: 'dbIncrement',
  //   fields: ['username']
  // })
  declare username: string

  @column()
  declare email: string

  @column({ serializeAs: null })
  declare password: string

  @column({ serializeAs: null })
  declare stripeCustomerId: string | null

  @column()
  declare stripeSubscriptionStatus: StripeSubscriptionStatuses | null

  @column.dateTime()
  declare stripeSubscriptionPausedAt: DateTime | null

  @column.dateTime()
  declare stripeSubscriptionCanceledAt: DateTime | null

  @column()
  declare billToInfo: string | null

  @column()
  declare rememberMeToken?: string

  @column()
  declare avatarUrl: string

  @column()
  declare githubId: string

  @column()
  declare googleId: string

  @column()
  declare githubEmail: string

  @column()
  declare googleEmail: string

  @column()
  declare githubAccessToken: string

  @column()
  declare googleAccessToken: string

  @column()
  declare twitterAccessToken: string

  @column()
  public theme: string = Themes.SYSTEM

  @column()
  declare isEnabledProfile: boolean

  @column()
  declare isEnabledMiniPlayer: boolean

  @column()
  declare isEnabledAutoplayNext: boolean

  @column()
  declare emailVerified: string | null

  @column.dateTime()
  declare emailVerifiedAt: DateTime | null

  @column.dateTime()
  declare planPeriodStart: DateTime | null

  @column.dateTime()
  declare planPeriodEnd: DateTime | null

  @column.dateTime({ autoCreate: true })
  declare createdAt: DateTime

  @column.dateTime({ autoCreate: true, autoUpdate: true })
  declare updatedAt: DateTime

  @computed()
  public get handle() {
    return `@${this.username}`
  }

  @computed()
  public get memberDuration() {
    if (!this.createdAt) return
    return this.createdAt.toRelative()
  }

  @computed()
  public get avatar() {
    if (this.avatarUrl) {
      if (this.avatarUrl.startsWith('https://')) {
        return this.avatarUrl
      }
      
      return `/img/${this.avatarUrl}`
    }

    return gravatar.url(this.email, { s: '60' })
  }

  @computed()
  public get avatarLarge() {
    if (this.avatarUrl) {
      if (this.avatarUrl.startsWith('https://')) {
        return this.avatarUrl
      }
      
      return `/img/${this.avatarUrl}`
    }

    return gravatar.url(this.email, { s: '250' })
  }

  @computed()
  public get isAdmin() {
    return this.roleId === Roles.ADMIN
  }

  @computed()
  public get isSubscriptionActive() {
    if (this.planId === Plans.FOREVER) return true
    return this.stripeSubscriptionStatus === StripeSubscriptionStatuses.ACTIVE
  }

  @computed()
  public get isFreeTier() {
    return this.planId === Plans.FREE || !this.isSubscriptionActive
  }

  @computed()
  public get isEmailVerified() {
    // has gone through verification flow
    if (this.emailVerified == this.email && this.emailVerifiedAt) return true
    
    // using third-party social auth
    if (this.email == this.githubEmail || this.email == this.googleEmail) return true

    return false
  }

  @beforeSave()
  public static async hashPassword (user: User) {
    if (user.$dirty.password && !user.$extras.rehash) {
      user.password = await Hash.make(user.password)
    }
  }

  @belongsTo(() => Role)
  declare role: BelongsTo<typeof Role>

  @belongsTo(() => Plan)
  declare plan: BelongsTo<typeof Plan>

  @hasMany(() => Collection, {
    foreignKey: 'ownerId'
  })
  declare collections: HasMany<typeof Collection>

  @hasMany(() => Comment)
  declare comments: HasMany<typeof Comment>

  @hasOne(() => Profile)
  declare profile: HasOne<typeof Profile>

  @hasMany(() => SessionLog)
  declare sessions: HasMany<typeof SessionLog>

  @manyToMany(() => Post, {
    pivotTable: 'author_posts',
    pivotColumns: ['author_type_id']
  })
  declare posts: ManyToMany<typeof Post>

  @manyToMany(() => Comment, {
    pivotTable: 'comment_votes'
  })
  declare commentVotes: ManyToMany<typeof Comment>

  @hasMany(() => Watchlist)
  declare watchlist: HasMany<typeof Watchlist>

  @hasMany(() => EmailHistory)
  declare emailHistory: HasMany<typeof EmailHistory>

  @hasMany(() => History)
  declare histories: HasMany<typeof History>

  @hasMany(() => History, {
    onQuery: query => query.where('historyTypeId', HistoryTypes.PROGRESSION).whereNotNull('postId').where('watchSeconds', '>', 0)
  })
  declare watchedPosts: HasMany<typeof History>

  @hasMany(() => History, {
    onQuery: query => query.where('historyTypeId', HistoryTypes.PROGRESSION).whereNotNull('postId').where('isCompleted', true)
  })
  declare completedPosts: HasMany<typeof History>

  @hasMany(() => Notification)
  declare notifications: HasMany<typeof Notification>

  @hasMany(() => Notification, {
    foreignKey: 'initiatorUserId'
  })
  declare initiatedNotifications: HasMany<typeof Notification>

  @hasMany(() => Question)
  declare questions: HasMany<typeof Question>

  @hasMany(() => LessonRequest)
  declare lessonRequests: HasMany<typeof LessonRequest>

  @hasMany(() => RequestVote)
  declare requestVotes: HasMany<typeof RequestVote>

  @hasMany(() => RequestVote, {
    onQuery: query => query.whereNotNull('lessonRequestId')
  })
  declare lessonRequestVotes: HasMany<typeof RequestVote>

  @hasMany(() => Invoice)
  declare invoices: HasMany<typeof Invoice>

  async verifyPasswordForAuth(plainTextPassword: string) {
    return hash.use('argon').verify(this.password, plainTextPassword)
  }

  public static async getUserForAuth(uids: string[], value: string) {
    const query = this.query()
    uids.map(uid => query.orWhereILike(uid, value))
    return query.first()
  }
}
