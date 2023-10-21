import { DateTime } from 'luxon'
import { BaseModel, BelongsTo, beforeSave, belongsTo, column, computed } from '@ioc:Adonis/Lucid/Orm'
import User from './User'
import uap from 'ua-parser-js'
import * as timeago from 'timeago.js'

export default class SessionLog extends BaseModel {
  @column({ isPrimary: true })
  public id: number

  @column()
  public userId: number

  @column()
  public token: string

  @column()
  public ipAddress: string | null

  @column()
  public userAgent: string | null

  @column()
  public city: string | null

  @column()
  public country: string | null

  @column()
  public countryCode: string | null

  @column.dateTime()
  public lastTouchedAt: DateTime | null

  @column.dateTime()
  public loginAt: DateTime | null

  @column()
  public loginSuccessful: boolean

  @column.dateTime()
  public logoutAt: DateTime | null

  @column()
  public forceLogout: boolean

  @column.dateTime({ autoCreate: true })
  public createdAt: DateTime

  @column.dateTime({ autoCreate: true, autoUpdate: true })
  public updatedAt: DateTime

  @belongsTo(() => User)
  public user: BelongsTo<typeof User>

  public isCurrentSession: boolean = false

  @computed()
  public get lastTouchedAgo() {
    if (!this.lastTouchedAt) return
    return timeago.format(this.lastTouchedAt.toJSDate())
  }

  @computed()
  public get device() {
    if (!this.userAgent) return {}
    return uap(this.userAgent)
  }

  @computed()
  public get browser() {
    if (!this.device.browser) return '--'
    
    const info = [
      `${this.device.browser?.name} ${this.device.browser?.version}`,
      `${this.device.os.name} ${this.device.os.version}`
    ].filter(Boolean)
    
    return info.join(', ')
  }

  @computed()
  public get location() {
    if (!this.city && !this.country) return '--'
    
    const info = [
      this.city,
      this.country
    ].filter(Boolean).filter(i => i !== '-')

    return info.length ? info.join(', ') : '--'
  }
}
