import { Request } from '@adonisjs/core/http'
import app from '@adonisjs/core/services/app'
import crypto from 'node:crypto'
import { IP2Location } from 'ip2location-nodejs'
import {
  uniqueNamesGenerator,
  NumberDictionary,
  animals,
  colors,
  names,
  starWars,
} from 'unique-names-generator'
import CacheService from './cache_service.js'
import env from '#start/env'
import logger from './logger_service.js'

export default class IdentityService {
  protected static key: string = env.get('IDENTITY_SECRET')

  static async getLocation(ip: string | undefined) {
    const fallback = { city: undefined, countryLong: undefined, countryShort: undefined }
    if (app.inTest || !ip) return fallback

    try {
      const ip2Location = new IP2Location()
      const version = ip.includes(':') ? 'IPV6' : 'IPV4'
      const bin = app.publicPath(`ip2location/DB3.${version}.BIN`)

      ip2Location.open(bin)

      const data = ip2Location.getAll(ip)

      ip2Location.close()

      return data
    } catch (error) {
      await logger.error('IdentityService.getLocation', error.message)
      return fallback
    }
  }

  static async getRequestIdentity(request: Request) {
    const ip = request.ip()
    const agent = request.header('user-agent')
    return this.create(ip, agent)
  }

  static async getIdentity(ip: string, agent: string) {
    return this.create(ip, agent)
  }

  static generateName(): string {
    const numberDictionary = NumberDictionary.generate({ min: 1, max: 999 })
    const name: string = uniqueNamesGenerator({
      dictionaries: [[...animals, ...colors], [...names, ...starWars], numberDictionary],
      length: 3,
      separator: '',
      style: 'capital',
    })

    return name
  }

  static async create(ip: string, agent?: string): Promise<string> {
    const secret = await this.secret()
    return crypto.createHash('md5').update(`${secret}${ip}${agent}`).digest('hex')
  }

  private static async secret() {
    if (await CacheService.has(this.key)) {
      return CacheService.get(this.key)
    }

    const secret = crypto.randomBytes(16).toString('base64')
    CacheService.set(this.key, secret)

    return secret
  }
}
