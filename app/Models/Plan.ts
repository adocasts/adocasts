import { DateTime } from 'luxon'
import { BaseModel, column, computed } from '@ioc:Adonis/Lucid/Orm'
import Env from '@ioc:Adonis/Core/Env'
import UtilityService from 'App/Services/UtilityService'
import Plans from 'App/Enums/Plans'
import CouponDurations from 'App/Enums/CouponDurations'

export default class Plan extends BaseModel {
  @column({ isPrimary: true })
  public id: number

  @column()
  public slug: string

  @column()
  public name: string

  @column()
  public description: string

  @column()
  public stripePriceId: string | null

  @column()
  public stripePriceTestId: string | null

  @column()
  public price: number

  @column()
  public isActive: true

  @column()
  public couponCode: string | null

  @column()
  public couponDiscountFixed: number | null

  @column()
  public couponDiscountPercent: number | null

  @column()
  public couponDurationId: number | null

  @column()
  public stripeCouponId: string | null

  @column.dateTime()
  public couponStartAt: DateTime | null

  @column.dateTime()
  public couponEndAt: DateTime | null

  @column.dateTime({ autoCreate: true })
  public createdAt: DateTime

  @column.dateTime({ autoCreate: true, autoUpdate: true })
  public updatedAt: DateTime

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

    if (this.couponDiscountFixed) amount = `${UtilityService.formatCurrency(this.couponDiscountFixed, 'USD', 'en-US', 0)}`
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
    return UtilityService.formatCurrency(this.price, 'USD', 'en-US', 0)
  }

  @computed()
  public get displaySalePrice() {
    return UtilityService.formatCurrency(this.salePrice, 'USD', 'en-US', 0)
  }
}
