import BaseModelDto from '#dtos/base_model_dto'
import Plan from '#models/plan'

export default class PlanDto extends BaseModelDto {
  static model() {
    return Plan
  }

  declare id: number
  declare slug: string
  declare name: string
  declare price: number
  declare salePrice: number
  declare hasActiveSale: boolean
  declare stripePriceId: string | null
  declare displayPrice: string
  declare displaySalePrice: string
  declare coupon: string | null
  declare couponDescriptor?: string
  declare couponAmount: string

  constructor(plan?: Plan) {
    super()

    if (!plan) return

    this.id = plan.id
    this.slug = plan.slug
    this.name = plan.name
    this.price = plan.price
    this.salePrice = plan.salePrice
    this.hasActiveSale = !!plan.hasActiveSale
    this.stripePriceId = plan.stripePriceId
    this.displayPrice = plan.displayPrice
    this.displaySalePrice = plan.displaySalePrice
    this.coupon = plan.couponCode
    this.couponDescriptor = plan.couponDescriptor
    this.couponAmount = plan.couponAmount
  }
}
