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

class User extends AppBaseModel {
  @column({ isPrimary: true })
  public id: number

  @column()
  public roleId: number

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

  @column.dateTime({ autoCreate: true })
  public createdAt: DateTime

  @column.dateTime({ autoCreate: true, autoUpdate: true })
  public updatedAt: DateTime

  @computed()
  public get avatar() {
    if (this.avatarUrl) {
      if (this.avatarUrl.startsWith('https://')) {
        return this.avatarUrl
      }
      
      return `/img/${this.avatarUrl}`
    }

    return gravatar.url(this.email, { s: '40' })
  }

  @beforeSave()
  public static async hashPassword (user: User) {
    if (user.$dirty.password) {
      user.password = await Hash.make(user.password)
    }
  }

  @belongsTo(() => Role)
  public role: BelongsTo<typeof Role>

  @hasMany(() => Collection, {
    foreignKey: 'ownerId'
  })
  public collections: HasMany<typeof Collection>

  @hasMany(() => Comment)
  public comments: HasMany<typeof Comment>

  @hasOne(() => Profile)
  public profile: HasOne<typeof Profile>

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

  @hasMany(() => Notification)
  public notifications: HasMany<typeof Notification>

  @hasMany(() => Notification, {
    foreignKey: 'initiatorUserId'
  })
  public initiatedNotifications: HasMany<typeof Notification>

  @hasMany(() => Question)
  public questions: HasMany<typeof Question>
}

User['findForAuth'] = function (uids: string[], uidValue: string) {
  const query = this.query()
  uids.map(uid => query.orWhere(uid, 'ILIKE', uidValue))
  return query.first()
}

export default User
