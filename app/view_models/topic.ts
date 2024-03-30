import Taxonomy from "#models/taxonomy";
import AssetVM from "./asset.js";
import PostListVM from "./post.js";
import SeriesListVM from "./series.js";

export default class TopicListVM {
  static get(topic: Taxonomy) {
    return {
      id: topic.id,
      name: topic.name,
      slug: topic.slug,
      description: topic.description,
      asset: this.#getAsset(topic),
      posts: topic.posts?.map((post) => new PostListVM(post)),
      collections: topic.collections?.map((collection) => new SeriesListVM(collection)),
      meta: {
        collectionsCount: topic.$extras.collections_count || 0,
        postsCount: topic.$extras.posts_count || 0
      },
    }
  }

  static #getAsset(topic: Taxonomy) {
    if (!topic.asset) return null
    return new AssetVM(topic.asset)
  }
}
