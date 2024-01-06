import redis from '@adonisjs/redis/services/main'
import env from '#start/env'
import CacheKeys from '#enums/cache_keys'

export default class CacheService {
  static enabled = env.get('REDIS_ENABLED')
  static fiveMinutes = 300
  static oneDay = 86_400
  static oneMonth = 2_592_000
  static stdTTL = CacheService.oneDay

  static get globalKeys() {
    return [CacheKeys.HOME, CacheKeys.SERIES, CacheKeys.TOPICS, CacheKeys.RSS_FEED]
  }

  static async set(key: string, value: any, ttl: number | null = null): Promise<void> {
    if (!this.enabled) return

    if (ttl) {
      await redis.set(key, value, 'EX', ttl)
    } else {
      await redis.set(key, value)
    }
  }

  static async setSerialized(key: string, value: any, ttl: number | null = null): Promise<void> {
    if (!this.enabled) return

    if (typeof value === 'object' && typeof value.__onCache === 'function') {
      value = value.__onCache()
    }

    return this.set(key, JSON.stringify(value), ttl)
  }

  static async destroy(key: string | string[]): Promise<void> {
    if (!this.enabled) return

    await redis.del(...key)
  }

  static async destroyAll() {
    if (!this.enabled) return

    await redis.flushdb()
  }

  static async destroyExpiry(key: string) {
    if (!this.enabled) return

    await redis.del(`EXPIRE_${key}`)
  }

  static async get(key: string, defaultValue: any = null): Promise<any> {
    if (!this.enabled) return defaultValue

    const value = await redis.get(key)
    return value ?? defaultValue
  }

  static async getParsed(key: string): Promise<any> {
    if (!this.enabled) return

    const result = await redis.get(key)
    return result ? JSON.parse(result) : result
  }

  static async has(key: string): Promise<boolean> {
    if (!this.enabled) return false

    return (await redis.exists(key)) === 1
  }

  static async keys(pattern: string = ''): Promise<string[]> {
    if (!this.enabled) return []

    return redis.keys(pattern)
  }

  static async try(key: string, callback: () => Promise<any>, ttl: number | null = null) {
    if (!this.enabled) return callback()

    if (await this.has(key)) {
      return this.getParsed(key)
    }

    const data = await callback()
    await this.destroyExpiry(key)
    await this.setSerialized(key, data, ttl)
    return data
  }

  static async clearGlobals() {
    await this.destroy(this.globalKeys)
  }
}
