import CacheNamespaces from "#enums/cache_namespaces";
import Plans from "#enums/plans";
import Plan from "#models/plan";
import { PlanVM } from "../view_models/plan.js";
import bento from "./bento_service.js";

export default class PlanService {
  static #cacheKey = CacheNamespaces.PLANS

  static get cache() {
    return bento.namespace(this.#cacheKey)
  }

  static async all() {
    const plusMonthly = await this.get(Plans.PLUS_MONTHLY)
    const plusAnnual = await this.get(Plans.PLUS_ANNUAL)
    const plusForever = await this.get(Plans.FOREVER)

    return { plusMonthly, plusAnnual, plusForever }
  }

  static async get(id: Plans) {
    return this.cache.getOrSet(id.toString(), async () => {
      const plan = await Plan.findOrFail(id)
      return PlanVM.get(plan)
    })
  }
}
