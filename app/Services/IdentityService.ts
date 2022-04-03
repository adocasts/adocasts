import Database from "@ioc:Adonis/Lucid/Database";
import CacheService from 'App/Services/CacheService';
import { uniqueNamesGenerator, NumberDictionary, animals, colors, names, starWars } from 'unique-names-generator';
import crypto from 'crypto';

class IdentityService {
  protected key: string = 'identity-secret';

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