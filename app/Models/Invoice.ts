import { DateTime } from 'luxon'
import { BaseModel, BelongsTo, belongsTo, column } from '@ioc:Adonis/Lucid/Orm'
import User from './User'

export default class Invoice extends BaseModel {
  @column({ isPrimary: true })
  public id: number

  @column()
  public userId: number

  @column()
  public invoiceId: string

  @column()
  public invoiceNumber: string

  @column()
  public chargeId: string

  @column()
  public amountDue: number

  @column()
  public amountPaid: number

  @column()
  public amountRemaining: number

  @column()
  public status: string | null

  @column()
  public paid: boolean | null

  @column.dateTime()
  public periodStartAt: DateTime | null

  @column.dateTime()
  public periodEndAt: DateTime | null

  @column.dateTime({ autoCreate: true })
  public createdAt: DateTime

  @column.dateTime({ autoCreate: true, autoUpdate: true })
  public updatedAt: DateTime

  @belongsTo(() => User)
  public user: BelongsTo<typeof User>
}
