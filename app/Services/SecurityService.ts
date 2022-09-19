import IdentityService from "./IdentityService";
import User from 'App/Models/User'
import DiscordLogger from "@ioc:Logger/Discord";

export default class SecurityService {
  public static async isGraylisted(ip: string, user: User | undefined) {
    try {
      const { country, latitude, longitude } = await IdentityService.getLocation(ip)

      if (!user && country === 'Russia' && latitude === 55.7386 && longitude === 37.6068) {
        return true
      }
    } catch (error) {
      DiscordLogger.error('SecurityService.isGraylisted', { error, userId: user?.id, ip })
    }

    return false
  }
}