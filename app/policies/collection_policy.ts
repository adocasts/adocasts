import { SeriesShowDto } from '#dtos/series_show'
import RepositoryAccessLevels from '#enums/repository_access_levels'
import Collection from '#models/collection'
import User from '#models/user'
import { allowGuest, BasePolicy } from '@adonisjs/bouncer'

export default class CollectionPolicy extends BasePolicy {
  @allowGuest()
  async viewRepository(user: User, collection: Collection | SeriesShowDto) {
    if (!collection.repositoryUrl) return false

    if (collection.repositoryAccessLevel === RepositoryAccessLevels.PUBLIC) {
      return true
    }

    if (!user) return false

    return !user.isFreeTier
  }
}
