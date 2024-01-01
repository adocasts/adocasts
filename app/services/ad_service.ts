import AdvertisementSizes from "#enums/advertisement_sizes";
import States from "#enums/states";
import Advertisement from "#models/advertisement";

export default class AdService {
  public static async getLeaderboard() {
    return Advertisement.query()
      .preload('asset')
      .preload('size')
      .where('sizeId', AdvertisementSizes.LEADERBOARD)
      .where('stateId', States.PUBLIC)
      .orderByRaw('RANDOM()')
      .first()
  }

  public static async getMediumRectangles(limit: number = 3) {
    return Advertisement.query()
      .preload('asset')
      .preload('size')
      .where('sizeId', AdvertisementSizes.MEDIUM_RECTANGLE)
      .where('stateId', States.PUBLIC)
      .orderByRaw('RANDOM()')
      .limit(limit)
  }
}