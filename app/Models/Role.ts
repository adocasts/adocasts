import { DateTime } from 'luxon'
import { column, HasMany, hasMany } from '@ioc:Adonis/Lucid/Orm'
import User from './User'
import AppBaseModel from 'App/Models/AppBaseModel'

export default class Role extends AppBaseModel {
  @column({ isPrimary: true })
  public id: number

  @column()
  public name: string

  @column()
  public description: string

  @column.dateTime({ autoCreate: true })
  public createdAt: DateTime

  @column.dateTime({ autoCreate: true, autoUpdate: true })
  public updatedAt: DateTime

  @hasMany(() => User)
  public users: HasMany<typeof User>
}
