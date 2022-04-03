import Redis from '@ioc:Adonis/Addons/Redis'

export default class CacheService {
  public static stdTTL = 86_400

  public static async set(key: string, value: any, ttl: number = this.stdTTL): Promise<void> {
    await Redis.set(key, value, "EX", ttl)
  }

  public static async destroy(key: string): Promise<void> {
    await Redis.del(key)
  }

  public static async get(key: string): Promise<any> {
    return Redis.get(key)
  }

  public static async has(key: string): Promise<boolean> {
    return (await Redis.exists(key)) === 1
  }

  public static async keys(pattern: string = ''): Promise<string[]> {
    return Redis.keys(pattern)
  }
}