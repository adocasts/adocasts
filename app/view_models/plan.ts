import Plan from "#models/plan";

export class PlanVM {
  static get(plan: Plan) {
    return {
      id: plan.id,
      slug: plan.slug,
      name: plan.name,
      price: plan.price,
      salePrice: plan.salePrice,
      hasActiveSale: plan.hasActiveSale,
      stripePriceId: plan.stripePriceId,
      displayPrice: plan.displayPrice,
      coupon: plan.couponCode,
      couponDescriptor: plan.couponDescriptor,
      couponAmount: plan.couponAmount
    }
  }
}
