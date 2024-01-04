import AdvertisementSizes from "#enums/advertisement_sizes";
import AnalyticTypes from "#enums/analytic_types";
import Plans from "#enums/plans";
import States from "#enums/states";
import Advertisement from "#models/advertisement";
import AdvertisementEvent from "#models/advertisement_event";
import User from "#models/user";

export default class AdService {
  public static async getLeaderboard() {
    const users = await this.getRandomAdUsers(AdvertisementSizes.LEADERBOARD, 1)

    if (!users.length) return

    return Advertisement.query()
      .preload('asset')
      .preload('size')
      .where('userId', users[0].id)
      .where('sizeId', AdvertisementSizes.LEADERBOARD)
      .where('stateId', States.PUBLIC)
      .orderByRaw('RANDOM()')
      .first()
  }

  public static async getMediumRectangles(limit: number = 3) {
    // get random users, then pull an ad per-user, to give each user a fair shot at getting pulled
    // regardless of how many ads they have
    const users = await this.getRandomAdUsers(AdvertisementSizes.MEDIUM_RECTANGLE, limit)
    const promises = users.map(user => {
      return Advertisement.query()
        .preload('asset')
        .preload('size')
        .where('userId', user.id)
        .where('sizeId', AdvertisementSizes.MEDIUM_RECTANGLE)
        .where('stateId', States.PUBLIC)
        .orderByRaw('RANDOM()')
        .first()
    })

    if (promises.length < limit) {
      // if we don't have enough ads, get some random ads
      const remaining = limit - promises.length
      const ads = await Promise.all(promises).then(ads => ads.filter(ad => !!ad))
      const adIds = ads.map(ad => ad!.id)
      const moreAds = await Advertisement.query()
        .preload('asset')
        .preload('size')
        .whereNotIn('id', adIds)
        .where('sizeId', AdvertisementSizes.MEDIUM_RECTANGLE)
        .where('stateId', States.PUBLIC)
        .orderByRaw('RANDOM()')
        .limit(remaining)

      return [...ads, ...moreAds]
    }

    return Promise.all(promises).then(ads => ads.filter(ad => !!ad))
  }

  public static async getRandomAdUsers(sizeId: AdvertisementSizes, limit: number = 1) {
    return User.query()
      .where('planId', '!=', Plans.FREE)
      .whereHas('ads', query => query
        .where('sizeId', sizeId)
        .where('stateId', States.PUBLIC)
      )
      .orderByRaw('RANDOM()')
      .limit(limit)
  }

  public static async getTotalStats(adIds: number[]) {
    const query = AdvertisementEvent.query().whereIn('advertisementId', adIds)
    const totalImpressions = await query.clone().where('typeId', AnalyticTypes.IMPRESSION).count('id').first()
    const totalClicks = await query.clone().where('typeId', AnalyticTypes.CLICK).count('id').first()
    const uniqueImpressions = await query.clone().where('typeId', AnalyticTypes.IMPRESSION).countDistinct(['advertisement_id', 'identity'], 'unique_impressions_count').first()
    const uniqueClicks = await query.clone().where('typeId', AnalyticTypes.CLICK).countDistinct(['advertisement_id', 'identity'], 'unique_clicks_count').first()
  
    return { 
      totalImpressions: totalImpressions?.$extras.count ?? 0, 
      totalClicks: totalClicks?.$extras.count ?? 0,
      uniqueImpressions: uniqueImpressions?.$extras.unique_impressions_count ?? 0,
      uniqueClicks: uniqueClicks?.$extras.unique_clicks_count ?? 0
    }
  }
}
