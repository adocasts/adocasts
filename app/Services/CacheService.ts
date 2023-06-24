import Redis from '@ioc:Adonis/Addons/Redis'
import CacheKeys from 'App/Enums/CacheKeys'
import RedisConfig from 'Config/redis'

export default class CacheService {
  public static fiveMinutes = 300
  public static oneDay = 86_400
  public static stdTTL = CacheService.oneDay

  public static get globalKeys() {
    return [
      CacheKeys.HOME,
      CacheKeys.SERIES,
      CacheKeys.TOPICS,
      CacheKeys.RSS_FEED
    ]
  }

  public static async set(key: string, value: any, ttl: number | null = null): Promise<void> {
    if (ttl) {
      await Redis.set(key, value, "EX", ttl)
    } else {
      await Redis.set(key, value)
    }
  }

  public static async setSerialized(key: string, value: any, ttl: number | null = null): Promise<void> {
    if (typeof value === 'object' && typeof value.__onCache === 'function') {
      value = value.__onCache()
    }

    return this.set(key, JSON.stringify(value), ttl)
  }

  public static async destroy(key: string | string[]): Promise<void> {
    await Redis.del(...key)
  }

  public static async destroyAll() {
    await Redis.flushdb()
  }

  public static async destroyExpiry(key: string) {
    await Redis.del(`EXPIRE_${key}`)
  }

  public static async get(key: string, defaultValue: any = null): Promise<any> {
    const value = await Redis.get(key)
    return value ?? defaultValue
  }

  public static async getParsed(key: string): Promise<any> {
    const result = await Redis.get(key)
    return result ? JSON.parse(result) : result
  }

  public static async has(key: string): Promise<boolean> {
    return (await Redis.exists(key)) === 1
  }

  public static async keys(pattern: string = ''): Promise<string[]> {
    return Redis.keys(pattern)
  }

  public static async try(key: string, callback: () => Promise<any>, ttl: number | null = null, forceCache: boolean = false) {
    if (!forceCache && !RedisConfig.enabled) return callback()

    if (await this.has(key)) {
      return this.getParsed(key)
    }

    const data = await callback()
    await this.destroyExpiry(key)
    await this.setSerialized(key, data, ttl)
    return data
  }

  public static async clearGlobals() {
    await this.destroy(this.globalKeys)
  }
}
