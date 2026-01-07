import PlanDto from '#dtos/plan'
import CacheNamespaces from '#enums/cache_namespaces'
import Plans from '#enums/plans'
import Plan from '#models/plan'
import cache from '@adonisjs/cache/services/main'

class PlanService {
  #cacheKey = CacheNamespaces.PLANS

  get cache() {
    return cache.namespace(this.#cacheKey)
  }

  async all() {
    const plusMonthly = await this.get(Plans.PLUS_MONTHLY)
    const plusAnnual = await this.get(Plans.PLUS_ANNUAL)
    const plusForever = await this.get(Plans.FOREVER)

    return { plusMonthly, plusAnnual, plusForever }
  }

  async get(id: Plans) {
    return this.cache.getOrSet({
      key: id.toString(),
      ttl: '30m',
      factory: async () => {
        const plan = await Plan.findOrFail(id)
        return PlanDto.fromModel(plan)
      },
    })
  }

  async getBySlug(slug: string) {
    return this.cache.getOrSet({
      key: slug.toString(),
      ttl: '30m',
      factory: async () => {
        const plan = await Plan.findByOrFail('slug', slug)
        return PlanDto.fromModel(plan)
      },
    })
  }
}

const plan = new PlanService()
export default plan
