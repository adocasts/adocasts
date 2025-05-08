import { DateTime } from 'luxon'
import { BaseModel, belongsTo, column } from '@adonisjs/lucid/orm'
import type { BelongsTo } from '@adonisjs/lucid/types/relations'
import User from '#models/user'

export default class Invoice extends BaseModel {
  @column({ isPrimary: true })
  declare id: number

  @column()
  declare userId: number

  @column()
  declare invoiceId: string

  @column()
  declare invoiceNumber: string

  @column()
  declare chargeId: string

  @column()
  declare amountDue: number

  @column()
  declare amountPaid: number

  @column()
  declare amountRemaining: number

  @column()
  declare status: string | null

  @column()
  declare paid: boolean | null

  @column.dateTime()
  declare periodStartAt: DateTime | null

  @column.dateTime()
  declare periodEndAt: DateTime | null

  @column.dateTime({ autoCreate: true })
  declare createdAt: DateTime

  @column.dateTime({ autoCreate: true, autoUpdate: true })
  declare updatedAt: DateTime

  @belongsTo(() => User)
  declare user: BelongsTo<typeof User>
}
