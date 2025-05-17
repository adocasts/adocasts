// @ts-nocheck
import {
  BaseModel,
  beforeSave,
  belongsTo,
  column,
  computed,
  hasMany,
  hasOne,
  manyToMany,
} from '@adonisjs/lucid/orm'
import type { BelongsTo, HasMany, HasOne, ManyToMany } from '@adonisjs/lucid/types/relations'
import { DateTime } from 'luxon'
// import { slugify } from '@ioc:Adonis/Addons/LucidSlugify' // TODO
import Plans from '#enums/plans'
import Roles from '#enums/roles'
import StripeSubscriptionStatuses from '#enums/stripe_subscription_statuses'
import Themes from '#enums/themes'
import Advertisement from '#models/advertisement'
import Collection from '#models/collection'
import Comment from '#models/comment'
import Discussion from '#models/discussion'
import EmailHistory from '#models/email_history'
import History from '#models/history'
import Invoice from '#models/invoice'
import LessonRequest from '#models/lesson_request'
import Notification from '#models/notification'
import Plan from '#models/plan'
import Post from '#models/post'
import Profile from '#models/profile'
import Progress from '#models/progress'
import RequestVote from '#models/request_vote'
import SessionLog from '#models/session_log'
import Watchlist from '#models/watchlist'
import SlugService from '#services/slug_service'
import env from '#start/env'
import { withAuthFinder } from '@adonisjs/auth/mixins/lucid'
import { DbRememberMeTokensProvider } from '@adonisjs/auth/session'
import { compose } from '@adonisjs/core/helpers'
import hash from '@adonisjs/core/services/hash'
import Role from './role.js'

const AuthFinder = withAuthFinder(() => hash.use('argon'), {
  uids: ['email', 'username'],
  passwordColumnName: 'password',
})

export default class User extends compose(BaseModel, AuthFinder) {
  static rememberMeTokens = DbRememberMeTokensProvider.forModel(User)

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
  theme: string = Themes.SYSTEM

  @column()
  declare isEnabledProfile: boolean

  @column()
  declare isEnabledMiniPlayer: boolean

  @column()
  declare isEnabledAutoplayNext: boolean

  @column()
  declare isEnabledMentions: boolean

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
  get handle() {
    return `@${this.username}`
  }

  @computed()
  get memberDuration() {
    if (!this.createdAt) return
    return this.createdAt.toRelative()
  }

  @computed()
  get avatarRelative() {
    if (this.avatarUrl) {
      if (this.avatarUrl.startsWith('https://')) {
        return
      }

      return `/img/${this.avatarUrl}`
    }
  }

  @computed()
  get avatar() {
    if (this.avatarUrl) {
      if (this.avatarUrl.startsWith('https://')) {
        return this.avatarUrl
      }

      return `${env.get('ASSET_DOMAIN') || ''}/img/${this.avatarUrl}`
    }
  }

  @computed()
  get isAdmin() {
    return this.roleId === Roles.ADMIN
  }

  @computed()
  get isContributor() {
    return [Roles.CONTRIBUTOR_LVL_1, Roles.CONTRIBUTOR_LVL_2].includes(this.roleId)
  }

  @computed()
  get isSubscriptionActive() {
    if (this.planId === Plans.FOREVER) return true

    const isActive = this.stripeSubscriptionStatus === StripeSubscriptionStatuses.ACTIVE
    const isComplete = this.stripeSubscriptionStatus === StripeSubscriptionStatuses.COMPLETE

    return isActive || isComplete
  }

  @computed()
  get isFreeTier() {
    return this.planId === Plans.FREE || !this.isSubscriptionActive
  }

  @computed()
  get isEmailVerified() {
    // has gone through verification flow
    if (this.emailVerified === this.email && this.emailVerifiedAt) return true

    // using third-party social auth
    return this.email === this.githubEmail || this.email === this.googleEmail
  }

  @beforeSave()
  static async slugifyUsername(user: User) {
    if (user.$dirty.username) {
      const slugify = new SlugService<typeof User>({
        strategy: 'dbIncrement',
        fields: ['username'],
      })
      user.username = await slugify.make(User, 'username', user.username)
    }
  }

  @belongsTo(() => Role)
  declare role: BelongsTo<typeof Role>

  @belongsTo(() => Plan)
  declare plan: BelongsTo<typeof Plan>

  @hasMany(() => Collection, {
    foreignKey: 'ownerId',
  })
  declare collections: HasMany<typeof Collection>

  @hasMany(() => Advertisement)
  declare ads: HasMany<typeof Advertisement>

  @hasMany(() => Comment)
  declare comments: HasMany<typeof Comment>

  @hasMany(() => Discussion)
  declare discussions: HasMany<typeof Discussion>

  @manyToMany(() => Discussion, {
    pivotTable: 'discussion_votes',
  })
  declare discussionVotes: ManyToMany<typeof Discussion>

  @hasOne(() => Profile)
  declare profile: HasOne<typeof Profile>

  @hasMany(() => SessionLog)
  declare sessions: HasMany<typeof SessionLog>

  @manyToMany(() => Post, {
    pivotTable: 'author_posts',
    pivotColumns: ['author_type_id'],
  })
  declare posts: ManyToMany<typeof Post>

  @manyToMany(() => Comment, {
    pivotTable: 'comment_votes',
    pivotTimestamps: true,
  })
  declare commentVotes: ManyToMany<typeof Comment>

  @hasMany(() => Watchlist)
  declare watchlist: HasMany<typeof Watchlist>

  @hasMany(() => EmailHistory)
  declare emailHistory: HasMany<typeof EmailHistory>

  @hasMany(() => History)
  declare histories: HasMany<typeof History>

  @hasMany(() => Progress)
  declare progresses: HasMany<typeof Progress>

  @hasMany(() => Progress, {
    onQuery: (query) => query.whereNotNull('postId').where('watchSeconds', '>', 0),
  })
  declare watchedPosts: HasMany<typeof Progress>

  @hasMany(() => Progress, {
    onQuery: (query) => query.whereNotNull('postId').where('isCompleted', true),
  })
  declare completedPosts: HasMany<typeof Progress>

  @hasMany(() => Notification)
  declare notifications: HasMany<typeof Notification>

  @hasMany(() => Notification, {
    foreignKey: 'initiatorUserId',
  })
  declare initiatedNotifications: HasMany<typeof Notification>

  @hasMany(() => Question)
  declare questions: HasMany<typeof Question>

  @hasMany(() => LessonRequest)
  declare lessonRequests: HasMany<typeof LessonRequest>

  @hasMany(() => RequestVote)
  declare requestVotes: HasMany<typeof RequestVote>

  @hasMany(() => RequestVote, {
    onQuery: (query) => query.whereNotNull('lessonRequestId'),
  })
  declare lessonRequestVotes: HasMany<typeof RequestVote>

  @hasMany(() => Invoice)
  declare invoices: HasMany<typeof Invoice>

  async verifyPasswordForAuth(plainTextPassword: string) {
    return hash.use('argon').verify(this.password, plainTextPassword)
  }
}

User['findForAuth'] = function (uids: string[], value: string) {
  const query = User.query()
  uids.map((uid) => query.orWhereILike(uid, value))
  return query.first()
}
