import Collection from "#models/collection";
import AssetVM from "./asset.js";
import PostListVM from "./post.js";

export default class SeriesListVM {
  static get(series: Collection) {
    return {
      id: series.id,
      difficultyId: series.difficultyId,
      name: series.name,
      slug: series.slug,
      description: series.description,
      asset: this.#getAsset(series),
      posts: series.postsFlattened.map((post) => PostListVM.get(post)),
      meta: {
        postsCount: series.$extras.postsFlattened_count || 0,
        videoSecondsSum: series.$extras.videoSecondsSum
      },
      
    }
  }

  static #getAsset(collection: Collection) {
    if (!collection.asset) return null
    return AssetVM.get(collection.asset)
  }
}
