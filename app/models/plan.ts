import { PlanSchema } from '#database/schema'
import CouponDurations from '#enums/coupon_durations'
import Plans from '#enums/plans'
import User from '#models/user'
import CurrencyService from '#services/currency_service'
import Env from '#start/env'
import { computed, hasMany } from '@adonisjs/lucid/orm'
import type { HasMany } from '@adonisjs/lucid/types/relations'
import { DateTime } from 'luxon'

export default class Plan extends PlanSchema {
  @hasMany(() => User)
  declare users: HasMany<typeof User>

  @computed()
  get mode() {
    if (Env.get('NODE_ENV') === 'production') {
      return 'live'
    }

    return 'testing'
  }

  @computed()
  get priceId() {
    if (Env.get('NODE_ENV') === 'production') {
      return this.stripePriceId
    }

    return this.stripePriceTestId
  }

  @computed()
  get hasActiveSale() {
    if (!this.couponCode) return false
    const isStartInRange = !this.couponStartAt || this.couponStartAt <= DateTime.now()
    const isEndInRange = !this.couponEndAt || this.couponEndAt >= DateTime.now()
    return (
      isStartInRange && isEndInRange && (this.couponDiscountFixed || this.couponDiscountPercent)
    )
  }

  @computed()
  get couponDescriptor() {
    if (!this.hasActiveSale) return

    const isForeverPlan = this.id === Plans.FOREVER
    const isAnnualPlan = this.id === Plans.PLUS_ANNUAL
    let amount = `${this.couponDiscountPercent}%`
    let duration = isForeverPlan ? '' : 'while subscribed'

    if (this.couponDiscountFixed)
      amount = `${CurrencyService.format(this.couponDiscountFixed, 'USD')}`
    if (this.couponDurationId === CouponDurations.ONCE)
      duration = isForeverPlan ? '' : `off your first ${isAnnualPlan ? 'year' : 'month'}`

    return `${amount} ${duration}`
  }

  @computed()
  get couponAmount() {
    let amount = `${this.couponDiscountPercent}%`

    if (this.couponDiscountFixed)
      amount = `${CurrencyService.format(this.couponDiscountFixed, 'USD')}`

    return amount
  }

  @computed()
  get salePrice() {
    if (!this.hasActiveSale) return this.price

    if (this.couponDiscountFixed) {
      return this.price - this.couponDiscountFixed
    } else if (this.couponDiscountPercent) {
      return this.price - this.price * (this.couponDiscountPercent / 100)
    }

    return this.price
  }

  @computed()
  get displayPrice() {
    return CurrencyService.format(this.price, 'USD')
  }

  @computed()
  get displaySalePrice() {
    return CurrencyService.format(this.salePrice, 'USD')
  }
}
