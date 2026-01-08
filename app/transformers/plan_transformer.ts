import type Plan from '#models/plan'
import { BaseTransformer } from '@adonisjs/core/transformers'

export default class PlanTransformer extends BaseTransformer<Plan> {
  toObject() {
    return this.pick(this.resource, [
      'id',
      'slug',
      'name',
      'price',
      'salePrice',
      'hasActiveSale',
      'stripePriceId',
      'displayPrice',
      'displaySalePrice',
      'coupon',
      'couponDescriptor',
      'couponAmount',
    ])
  }
}
