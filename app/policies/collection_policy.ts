import { SeriesShowDto } from '#dtos/series_show'
import PaywallTypes from '#enums/paywall_types'
import Collection from '#models/collection'
import User from '#models/user'
import { allowGuest, BasePolicy } from '@adonisjs/bouncer'

export default class CollectionPolicy extends BasePolicy {
  @allowGuest()
  async viewRepository(user: User, collection: Collection | SeriesShowDto) {
    if (!collection.repositoryUrl) return false
    if (!collection.paywallTypeId || collection.paywallTypeId === PaywallTypes.NONE) {
      return true
    }

    if (!user) return false

    return !user.isFreeTier
  }
}
