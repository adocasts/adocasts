import Redis from '@ioc:Adonis/Addons/Redis'

export default class CacheService {
  public static fiveMinutes = 300
  public static oneDay = 86_400
  public static stdTTL = CacheService.oneDay

  public static async set(key: string, value: any, ttl: number = this.stdTTL): Promise<void> {
    await Redis.set(key, value, "EX", ttl)
  }

  public static async setSerialized(key: string, value: any, ttl: number = this.stdTTL): Promise<void> {
    if (typeof value === 'object' && typeof value.__onCache === 'function') {
      value = value.__onCache()
    }

    await Redis.set(key, JSON.stringify(value), "EX", ttl)
  }

  public static async destroy(key: string): Promise<void> {
    await Redis.del(key)
  }

  public static async get(key: string): Promise<any> {
    return Redis.get(key)
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
}
