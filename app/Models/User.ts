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

export default class User extends AppBaseModel {
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
  avatarUrl: string

  @column()
  githubAccessToken: string

  @column()
  googleAccessToken: string

  @column()
  twitterAccessToken: string

  @column.dateTime({ autoCreate: true })
  public createdAt: DateTime

  @column.dateTime({ autoCreate: true, autoUpdate: true })
  public updatedAt: DateTime

  @computed()
  public get avatar() {
    if (this.avatarUrl) return `/img/${this.avatarUrl}`

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

  @hasMany(() => Watchlist)
  public watchlist: HasMany<typeof Watchlist>
  
  @hasMany(() => EmailHistory)
  public emailHistory: HasMany<typeof EmailHistory>
}
