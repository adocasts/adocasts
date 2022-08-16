import History from 'App/Models/History'
import HistoryTypes from 'App/Enums/HistoryTypes'
import HistoryValidator from 'App/Validators/HistoryValidator'
import BaseHttpService from 'App/Services/Http/BaseHttpService'
import Post from 'App/Models/Post'
import User from 'App/Models/User'
import State from 'App/Enums/States'

export default class HistoryService extends BaseHttpService {
  protected completedPercentThreshold = 93

  public async createView(data: Partial<History>) {
    if (!this.user) return
    return History.create({
      userId: this.user!.id,
      route: this.ctx.route?.name,
      historyTypeId: HistoryTypes.VIEW,
      ...data
    })
  }

  public async recordView() {
    if (!this.user) return
    const data = await this.ctx.request.validate(HistoryValidator)
    return this.createView(data)
  }

  public async recordPostView(postId: number) {
    return this.createView({ postId })
  }

  public async recordCollectionView(collectionId: number) {
    return this.createView({ collectionId })
  }

  public async recordTaxonomyView(taxonomyId: number) {
    return this.createView({ taxonomyId })
  }

  public static async getLatestSeriesProgress(user: User) {
    return History.query()
      .distinctOn('collectionId')
      .where('historyTypeId', HistoryTypes.PROGRESSION)
      .where('userId', user.id)
      .whereNotNull('collectionId')
      .where(query => query
        .where('isCompleted', false)
        .orWhereHas('collection', query => query
          .whereHas('postsFlattened', query => query
            .whereDoesntHave('progressionHistory', query => query
              .where('userId', user.id)
              .where('isCompleted', true)
            )
          )
        )
      )
      .preload('collection', query => query
        .preload('asset')
        .withCount('postsFlattened', query => query.apply(scope => scope.published()).as('postCount'))
        .withCount('progressionHistory', query => query.where('userId', user.id).where('isCompleted', true).as('postCompletedCount'))
        .preload('postsFlattened', query => query
          .preload('assets')
          .preload('series', query => query
            .where('stateId', State.PUBLIC)
            .groupLimit(1)
          )
          .preload('progressionHistory', query => query
            .where('userId', user.id)
            .orderBy('updatedAt', 'desc')
            .groupLimit(1)
          )
          .whereDoesntHave('progressionHistory', query => query
            .where('userId', user.id)
            .where('isCompleted', true)
          )
          .groupOrderBy('root_sort_order', 'asc')
          .groupLimit(1)
        )
      )
      .limit(5)
  }

  public async getProgressionOrNew(data: Partial<History>) {
    const query: Partial<History> = {
      userId: this.user!.id,
      historyTypeId: HistoryTypes.PROGRESSION
    }

    if (data.postId)        query.postId = data.postId
    if (data.collectionId)  query.collectionId = data.collectionId
    if (data.taxonomyId)    query.taxonomyId = data.taxonomyId

    return History.firstOrNew(query, {
      userId: this.user!.id,
      route: this.ctx.route?.name,
      historyTypeId: HistoryTypes.PROGRESSION,
    })
  }

  public async createProgression(data: Partial<History>) {
    if (!this.user) return

    const progression = await this.getProgressionOrNew(data)

    if (typeof data.watchPercent === 'number' && progression.watchPercent && data.watchPercent < progression.watchPercent) {
      delete data.watchPercent
    }

    if (typeof data.readPercent === 'number' && progression.readPercent && data.readPercent < progression.readPercent) {
      delete data.readPercent
    }

    progression.merge(data)
    progression.isCompleted = this.isPercentCompleted(progression)

    await progression.save()

    return progression
  }

  public isPercentCompleted(progression: History) {
    if (progression.isCompleted) return true

    if (typeof progression.watchPercent === 'number' && progression.watchPercent >= this.completedPercentThreshold) {
      return true
    }

    return typeof progression.readPercent === 'number' && progression.readPercent >= this.completedPercentThreshold
  }

  public async recordProgression() {
    if (!this.user) return
    const data = await this.ctx.request.validate(HistoryValidator)
    return this.createProgression(data)
  }

  public async getPostProgression(post: Post) {
    if (!this.user) return
    return post.related('progressionHistory').query().where('userId', this.user!.id).orderBy('updatedAt', 'desc').first()
  }

  public async recordPostProgression(postId: number) {
    return this.createProgression({ postId })
  }

  public async toggleCompleted() {
    if (!this.user) return

    const data = await this.ctx.request.validate(HistoryValidator)

    const progression = await this.getProgressionOrNew(data)

    progression.isCompleted = !progression.isCompleted

    // if watch percent is above completed threshold, set to just under threshold
    if (progression.watchPercent && progression.watchPercent >= this.completedPercentThreshold) {
      progression.watchPercent = this.completedPercentThreshold - 1
    }

    // if watch percent is above completed threshold, set to just under threshold
    if (progression.readPercent && progression.readPercent >= this.completedPercentThreshold) {
      progression.readPercent = this.completedPercentThreshold - 1
    }

    await progression.save()

    return progression
  }
}
