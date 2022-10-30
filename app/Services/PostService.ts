import Asset from "App/Models/Asset";
import Post from "App/Models/Post";
import StorageService from "./StorageService";
import CacheService from 'App/Services/CacheService'
import PostType from 'App/Enums/PostType'
import DiscordLogger from "@ioc:Logger/Discord";

export default class PostService {
  public static async getFeatureSingle(excludeIds: number[] = []) {
    return Post.lessons()
      .apply(scope => scope.forDisplay())
      .if(excludeIds.length, query => query.whereNotIn('id', excludeIds))
      .whereHas('assets', query => query)
      .orderBy('publishAt', 'desc')
      .first()
  }

  public static async getLatest(limit: number = 10, excludeIds: number[] = [], postTypeIds: number | number[] = PostType.LESSON) {
    return Post.query()
      .apply(scope => scope.forDisplay())
      .if(Array.isArray(postTypeIds),
        query => query.where(q => (<number[]>postTypeIds).map(postTypeId => q.orWhere({ postTypeId }))),
        query => query.where({ postTypeId: postTypeIds })
      )
      .if(excludeIds.length, query => query.whereNotIn('id', excludeIds))
      .orderBy('publishAt', 'desc')
      .limit(limit)
  }

  public static async search(term: string, limit: number = 100) {
    return Post.lessons()
      .apply(scope => scope.forDisplay())
      .if(term, query => query
        .where('title', 'ILIKE', `%${term}%`)
        .orWhere('description', 'ILIKE', `%${term}%`)
        .orWhere('body', 'ILIKE', `${term}`)
      )
      .orderBy('publishAt', 'desc')
      .limit(limit)
  }

  public static async syncAssets(post: Post, assetIds: number[] = []) {
    const assetData = assetIds.reduce((prev, currentId, i) => ({
      ...prev,
      [currentId]: {
        sort_order: i
      }
    }), {})

    await post.related('assets').sync(assetData)
  }

  public static async destroyAssets(post: Post) {
    const assets = await post.related('assets').query().select(['id', 'filename'])
    const assetIds = assets.map(a => a.id)
    const assetFilenames = assets.map(a => a.filename)

    await post.related('assets').detach()
    await Asset.query().whereIn('id', assetIds).delete()

    StorageService.destroyAll(assetFilenames)
  }

  public static async syncTaxonomies(post: Post, taxonomyIds: number[] = []) {
    const taxonomyData = taxonomyIds.reduce((prev, currentId, i) => ({
      ...prev,
      [currentId]: {
        sort_order: i
      }
    }), {})

    await post.related('taxonomies').sync(taxonomyData)
  }

  public static async checkLive() {
    try {
      if (await CacheService.has('isLive')) {
        return CacheService.getParsed('isLive')
      }
    } catch (e) {
      await CacheService.destroy('isLive')
      await DiscordLogger.error('PostService.checkLive', e.message)
    }

    const live = await Post.query()
      .whereTrue('isLive')
      .whereNotNull('livestreamUrl')
      .apply(s => s.published())
      .orderBy('publishAt', 'desc')
      .first()

    await CacheService.setSerialized('isLive', live?.serialize(), CacheService.fiveMinutes)

    return live
  }
}
