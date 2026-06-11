import { SeriesShowDto } from '#dtos/series_show'
import RepositoryAccessLevels from '#enums/repository_access_levels'
import Collection from '#models/collection'
import User from '#models/user'
import { StripeService } from '#services/stripe_service'
import { allowGuest, BasePolicy } from '@adonisjs/bouncer'

export default class CollectionPolicy extends BasePolicy {
  @allowGuest()
  async viewRepository(user: User, collection: Collection | SeriesShowDto) {
    if (!collection.repositoryUrl) return false

    if (collection.repositoryAccessLevel === RepositoryAccessLevels.PUBLIC) {
      return true
    }

    if (!user) return false

    if (!StripeService.isActive) return true // Plus sunset: open to any authenticated user

    return !user.isFreeTier
  }
}
