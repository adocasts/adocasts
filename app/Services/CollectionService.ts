import Collection from 'App/Models/Collection'
import Database from '@ioc:Adonis/Lucid/Database'
import Post from 'App/Models/Post'
import CacheService from 'App/Services/CacheService'

export default class CollectionService {
  public static async getLastUpdated(limit: number = 4, excludeIds: number[] = []) {
    return Collection.series()
      .apply(scope => scope.withPostLatestPublished())
      .if(excludeIds.length, query => query.whereNotIn('id', excludeIds))
      .withCount('postsFlattened', query => query.apply(scope => scope.published()))
      .withAggregate('postsFlattened', query => query.apply(scope => scope.published()).sum('video_seconds').as('videoSecondsSum'))
      .whereHas('postsFlattened', query => query.apply(scope => scope.published()))
      .preload('taxonomies', query => query.groupOrderBy('sort_order', 'asc').groupLimit(3))
      .preload('asset')
      .wherePublic()
      .whereNull('parentId')
      .orderBy('latest_publish_at', 'desc')
      .select(['collections.*'])
      .limit(limit)
  }

  public static async search(term: string, limit: number = 10) {
    return Collection.series()
      .apply(scope => scope.withPostLatestPublished())
      .withCount('postsFlattened', query => query.apply(scope => scope.published()))
      .withAggregate('postsFlattened', query => query.apply(scope => scope.published()).sum('video_seconds').as('videoSecondsSum'))
      .preload('taxonomies', query => query.groupOrderBy('sort_order', 'asc').groupLimit(3))
      .preload('asset')
      .wherePublic()
      .whereNull('parentId')
      .where(query => query
        .where('collections.name', 'ILIKE', `%${term}%`)
        .orWhere('collections.description', 'ILIKE', `%${term}%`)
      )
      .orderBy('latest_publish_at', 'desc')
      .select(['collections.*'])
      .limit(limit)
  }

  public static async getSeriesForPost(post: Post, userId: number | null = null) {
    return post.related('rootSeries').query()
      .wherePublic()
      .preload('posts', query => query.apply(scope => scope.forCollectionDisplay()))
      .preload('children', query => query
        .wherePublic()
        .preload('posts', query => query
          .apply(scope => scope.forCollectionDisplay())
          .if(userId, query => query.preload('progressionHistory', query => query.where({ userId })))
        )
      )
      .preload('updatedVersions', query => query
        .wherePublic()
        .whereHas('postsFlattened', query => query.apply(s => s.published()))
      )
      .first()
  }

  // TODO: finish
  public static async getPostCounts(collections: Collection[]) {
    const ids = collections.map(c => c.id)
    const subCollections = await Collection.query()
      .whereIn('parentId', ids)
      .orWhereIn('id', ids)
      .withCount('posts')
      .select('id')

    return subCollections
  }

  // TODO: finish
  public static async getPostCount(collection: Collection) {
    const subCollections = await Collection.query()
      .where('parentId', collection.id)
      .withCount('posts')
      .select('id')

    return subCollections
  }

  public static async updateOrCreate(collectionId: number | undefined, { postIds, taxonomyIds, subcollectionCollectionIds = [], subcollectionCollectionNames = [], subcollectionPostIds = [], ...data }: { [x: string]: any }) {
    const collection = await Collection.firstOrNewById(collectionId)

    await collection.merge(data).save()

    await CollectionService.syncPosts(collection, postIds, { root_collection_id: collection.id })
    await CollectionService.syncTaxonomies(collection, taxonomyIds)

    if (subcollectionPostIds) {
      await this.syncSubcollectionPosts(collection, subcollectionCollectionIds, subcollectionPostIds, subcollectionCollectionNames)
    }

    await CacheService.clearForCollection(collection.slug)

    return collection
  }

  public static async stub(userId: number, data: { parentId: number }) {
    return Collection.create({
      ...data,
      name: 'Your new collection',
      ownerId: userId
    })
  }

  public static async delete(collectionId: number) {
    const collection = await Collection.query()
      .where('id', collectionId)
      .preload('children', query => query.select('id'))
      .firstOrFail()

    const collectionIds = [...collection.children.map(c => c.id), collection.id]
    await Database.from('collection_posts').whereIn('collection_id', collectionIds).delete()
    await Database.from('collection_taxonomies').whereIn('collection_id', collectionIds).delete()
    await Collection.query().whereIn('id', collectionIds).delete()
    await CacheService.clearForCollection(collection.slug)

    return collection
  }

  public static async syncPosts(collection: Collection, postIds: number[] = [], intermediaryData: { [x: string]: any } = {}) {
    const syncData = this.getPostSyncData(postIds, intermediaryData)

    return collection.related('posts').sync(syncData)
  }

  public static async syncTaxonomies(collection: Collection, taxonomyIds: number[] = []) {
    const taxonomyData = taxonomyIds.reduce((prev, currentId, i) => ({
      ...prev,
      [currentId]: {
        sort_order: i
      }
    }), {})

    await collection.related('taxonomies').sync(taxonomyData)
  }

  public static getPostSyncData(postIds: number[] = [], intermediaryData: { [x: string]: any } = {}) {
    return postIds.reduce((prev, curr, i) => ({
      ...prev,
      [curr]: {
        ...intermediaryData,
        sort_order: i,
        root_sort_order: i
      }
    }), {})
  }

  public static async syncSubcollectionPosts(rootCollection: Collection, subcollectionCollectionIds: number[], subcollectionPostIds: number[][], subcollectionCollectionNames: string[]) {
    let rootSortOrder = -1

    const promises = subcollectionCollectionIds.map((collectionId, i) => {
      return new Promise(async (resolve) => {
        const postIds = subcollectionPostIds[i] ?? []
        const collectionName = subcollectionCollectionNames[i]
        const postSyncData = postIds.reduce((prev, curr, i) => ({
          ...prev,
          [curr]: {
            sort_order: i,
            root_sort_order: ++rootSortOrder,
            root_collection_id: rootCollection.id
          }
        }), {})

        const collection = await Collection.findOrFail(collectionId)

        await collection.merge({
          name: collectionName,
          collectionTypeId: rootCollection.collectionTypeId,
          sortOrder: i
        }).save()

        await collection.related('posts').sync(postSyncData)

        resolve(true)
      })
    })

    await Promise.all(promises)
  }
}
