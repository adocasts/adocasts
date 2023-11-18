import { DateTime } from 'luxon'
import { BaseModel, column, computed } from '@adonisjs/lucid/orm'
import Env from '#start/env'
import UtilityService from '#services/utility_service'
import Plans from '#enums/plans'
import CouponDurations from '#enums/coupon_durations'

export default class Plan extends BaseModel {
  @column({ isPrimary: true })
  declare id: number

  @column()
  declare slug: string

  @column()
  declare name: string

  @column()
  declare description: string

  @column()
  declare stripePriceId: string | null

  @column()
  declare stripePriceTestId: string | null

  @column()
  declare price: number

  @column()
  declare isActive: true

  @column()
  declare couponCode: string | null

  @column()
  declare couponDiscountFixed: number | null

  @column()
  declare couponDiscountPercent: number | null

  @column()
  declare couponDurationId: number | null

  @column()
  declare stripeCouponId: string | null

  @column.dateTime()
  declare couponStartAt: DateTime | null

  @column.dateTime()
  declare couponEndAt: DateTime | null

  @column.dateTime({ autoCreate: true })
  declare createdAt: DateTime

  @column.dateTime({ autoCreate: true, autoUpdate: true })
  declare updatedAt: DateTime

  @computed()
  public get mode() {
    if (Env.get('NODE_ENV') === 'production') {
      return 'live'
    }

    return 'testing'
  }

  @computed()
  public get priceId() {
    if (Env.get('NODE_ENV') === 'production') {
      return this.stripePriceId
    }

    return this.stripePriceTestId
  }

  @computed()
  public get hasActiveSale() {
    if (!this.couponCode) return false
    const isStartInRange = !this.couponStartAt || this.couponStartAt <= DateTime.now()
    const isEndInRange = !this.couponEndAt || this.couponEndAt >= DateTime.now()
    return isStartInRange && isEndInRange && (this.couponDiscountFixed || this.couponDiscountPercent)
  }

  @computed()
  public get couponDescriptor() {
    if (!this.hasActiveSale) return

    const isForeverPlan = this.id === Plans.FOREVER
    const isAnnualPlan = this.id === Plans.PLUS_ANNUAL
    let amount = `${this.couponDiscountPercent}%`
    let duration = isForeverPlan ? '' : 'while subscribed'

    if (this.couponDiscountFixed) amount = `${UtilityService.formatCurrency(this.couponDiscountFixed, 'USD')}`
    if (this.couponDurationId === CouponDurations.ONCE) duration = isForeverPlan ? '' : `off your first ${isAnnualPlan ? 'year' : 'month'}`

    return `${amount} ${duration}`
  }

  @computed()
  public get salePrice() {
    if (!this.hasActiveSale) return this.price

    if (this.couponDiscountFixed) {
      return this.price - this.couponDiscountFixed
    } else if (this.couponDiscountPercent) {
      return this.price - (this.price * (this.couponDiscountPercent / 100))
    }

    return this.price
  }

  @computed()
  public get displayPrice() {
    return UtilityService.formatCurrency(this.price, 'USD')
  }

  @computed()
  public get displaySalePrice() {
    return UtilityService.formatCurrency(this.salePrice, 'USD')
  }
}
