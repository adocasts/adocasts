import Database from "@ioc:Adonis/Lucid/Database";
import CacheService from 'App/Services/CacheService';
import { RequestContract } from '@ioc:Adonis/Core/Request';
import { uniqueNamesGenerator, NumberDictionary, animals, colors, names, starWars } from 'unique-names-generator';
import crypto from 'crypto';
import { IP2Location } from 'ip2location-nodejs'
import path from 'path'
import Application from '@ioc:Adonis/Core/Application';
import DiscordLogger from "@ioc:Logger/Discord";

class IdentityService {
  protected key: string = 'identity-secret';

  public async getLocation(ip: string | undefined) {
    const fallback = { city: undefined, countryLong: undefined, countryShort: undefined }
    if (Application.inTest || !ip) return fallback

    try {
      const ip2Location = new IP2Location()
      const version = ip.includes(':') ? 'IPV6' : 'IPV4'
      const bin = path.join(process.cwd(), `DB3.${version}.BIN`)

      ip2Location.open(bin)

      return ip2Location.getAll(ip)
    } catch (error) {
      await DiscordLogger.error('IdentityService.getLocation', error.message)
      return fallback
    }
  }

  public async getRequestIdentity(request: RequestContract) {
    const ip = request.ip()
    const agent = request.header('user-agent')
    return this.create(ip, agent)
  }

  public async getIdentity(ip: string, agent: string) {
    return this.create(ip, agent)
  }

  public async getByIdentity(table: string, identity: string, identityKey: string = 'name'): Promise<string> {
    const record = await Database.from(table).where('identity', identity).select([identityKey]).first();
    if (record && record.name) return record.name;

    return this.generateName();
  }

  public generateName(): string {
    const numberDictionary = NumberDictionary.generate({ min: 1, max: 999 });
    const name: string = uniqueNamesGenerator({
      dictionaries: [[...animals, ...colors], [...names, ...starWars], numberDictionary],
      length: 3,
      separator: '',
      style: 'capital'
    });

    return name;
  }

  public async create(ip: string, agent?: string): Promise<string> {
    const secret = await this.secret();
    return crypto.createHash('md5').update(`${secret}${ip}${agent}`).digest("hex");
  }

  private async secret() {
    if (await CacheService.has(this.key)) {
      return CacheService.get(this.key);
    }

    const secret = crypto.randomBytes(16).toString('base64');
    CacheService.set(this.key, secret);

    return secret;
  }
}

export default new IdentityService();