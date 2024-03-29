import Plan from "#models/plan";

export class PlanVM {
  static get(plan: Plan) {
    return {
      id: plan.id,
      slug: plan.slug,
      name: plan.name,
      price: plan.price,
      stripePriceId: plan.stripePriceId,
      displayPrice: plan.displayPrice
    }
  }
}
