import { DateTime } from 'luxon'
import Hash from '@ioc:Adonis/Core/Hash'
import { column, beforeSave, belongsTo, BelongsTo, hasMany, HasMany, hasOne, HasOne, manyToMany, ManyToMany, computed } from '@ioc:Adonis/Lucid/Orm'
import Role from './Role'
import Profile from './Profile'
import Post from './Post'
import { slugify } from '@ioc:Adonis/Addons/LucidSlugify'
import gravatar from 'gravatar'
import Collection from './Collection'
import Comment from './Comment'
import AppBaseModel from 'App/Models/AppBaseModel'
import Watchlist from 'App/Models/Watchlist'
import EmailHistory from 'App/Models/EmailHistory'
import Question from 'App/Models/Question'
import History from './History'
import Notification from './Notification'
import Themes from 'App/Enums/Themes'
import LessonRequest from './LessonRequest'
import Roles from 'App/Enums/Roles'
import RequestVote from './RequestVote'
import HistoryTypes from 'App/Enums/HistoryTypes'
import Plan from './Plan'
import Plans from 'App/Enums/Plans'
import StripeSubscriptionStatuses from 'App/Enums/StripeSubscriptionStatuses'
import SessionLog from './SessionLog'
import Invoice from './Invoice'

class User extends AppBaseModel {
  @column({ isPrimary: true })
  public id: number

  @column()
  public roleId: number

  @column()
  public planId: number

  @column()
  @slugify({
    strategy: 'dbIncrement',
    fields: ['username']
  })
  public username: string

  @column()
  public email: string

  @column({ serializeAs: null })
  public password: string

  @column({ serializeAs: null })
  public stripeCustomerId: string | null

  @column()
  public stripeSubscriptionStatus: StripeSubscriptionStatuses | null

  @column.dateTime()
  public stripeSubscriptionPausedAt: DateTime | null

  @column.dateTime()
  public stripeSubscriptionCanceledAt: DateTime | null

  @column()
  public billToInfo: string | null

  @column()
  public rememberMeToken?: string

  @column()
  public avatarUrl: string

  @column()
  public githubId: string

  @column()
  public googleId: string

  @column()
  public githubEmail: string

  @column()
  public googleEmail: string

  @column()
  public githubAccessToken: string

  @column()
  public googleAccessToken: string

  @column()
  public twitterAccessToken: string

  @column()
  public theme: string = Themes.SYSTEM

  @column()
  public isEnabledProfile: boolean

  @column()
  public isEnabledMiniPlayer: boolean

  @column()
  public isEnabledAutoplayNext: boolean

  @column()
  public emailVerified: string | null

  @column.dateTime()
  public emailVerifiedAt: DateTime | null

  @column.dateTime()
  public planPeriodStart: DateTime | null

  @column.dateTime()
  public planPeriodEnd: DateTime | null

  @column.dateTime({ autoCreate: true })
  public createdAt: DateTime

  @column.dateTime({ autoCreate: true, autoUpdate: true })
  public updatedAt: DateTime

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
  public role: BelongsTo<typeof Role>

  @belongsTo(() => Plan)
  public plan: BelongsTo<typeof Plan>

  @hasMany(() => Collection, {
    foreignKey: 'ownerId'
  })
  public collections: HasMany<typeof Collection>

  @hasMany(() => Comment)
  public comments: HasMany<typeof Comment>

  @hasOne(() => Profile)
  public profile: HasOne<typeof Profile>

  @hasMany(() => SessionLog)
  public sessions: HasMany<typeof SessionLog>

  @manyToMany(() => Post, {
    pivotTable: 'author_posts',
    pivotColumns: ['author_type_id']
  })
  public posts: ManyToMany<typeof Post>

  @manyToMany(() => Comment, {
    pivotTable: 'comment_votes'
  })
  public commentVotes: ManyToMany<typeof Comment>

  @hasMany(() => Watchlist)
  public watchlist: HasMany<typeof Watchlist>

  @hasMany(() => EmailHistory)
  public emailHistory: HasMany<typeof EmailHistory>

  @hasMany(() => History)
  public histories: HasMany<typeof History>

  @hasMany(() => History, {
    onQuery: query => query.where('historyTypeId', HistoryTypes.PROGRESSION).whereNotNull('postId').where('watchSeconds', '>', 0)
  })
  public watchedPosts: HasMany<typeof History>

  @hasMany(() => History, {
    onQuery: query => query.where('historyTypeId', HistoryTypes.PROGRESSION).whereNotNull('postId').where('isCompleted', true)
  })
  public completedPosts: HasMany<typeof History>

  @hasMany(() => Notification)
  public notifications: HasMany<typeof Notification>

  @hasMany(() => Notification, {
    foreignKey: 'initiatorUserId'
  })
  public initiatedNotifications: HasMany<typeof Notification>

  @hasMany(() => Question)
  public questions: HasMany<typeof Question>

  @hasMany(() => LessonRequest)
  public lessonRequests: HasMany<typeof LessonRequest>

  @hasMany(() => RequestVote)
  public requestVotes: HasMany<typeof RequestVote>

  @hasMany(() => RequestVote, {
    onQuery: query => query.whereNotNull('lessonRequestId')
  })
  public lessonRequestVotes: HasMany<typeof RequestVote>

  @hasMany(() => Invoice)
  public invoices: HasMany<typeof Invoice>
}

User['findForAuth'] = function (uids: string[], uidValue: string) {
  const query = this.query()
  uids.map(uid => query.orWhere(uid, 'ILIKE', uidValue))
  return query.first()
}

export default User
