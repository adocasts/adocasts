import Post from "#models/post"
import AssetVM from "./asset.js"

export default class PostListVM {
  static get(post: Post) {
    return {
      id: post.id,
      postTypeId: post.postTypeId,
      paywallTypeId: post.paywallTypeId,
      title: post.title,
      slug: post.slug,
      description: post.description,
      routeUrl: post.routeUrl,
      publishAtISO: post.publishAt?.toISO(),
      publishAtDisplay: post.publishAtDisplay,
      series: this.#getSeries(post),
      asset: this.#getAsset(post),
      animatedPreviewUrl: post.animatedPreviewUrl,
    }
  }

  static #getSeries(post: Post) {
    if (!post.series?.length) return null
    
    const series = post.series.at(0)!
    
    return {
      id: series.id,
      slug: series.slug,
      name: series.name,
      lessonIndexDisplay: post.lessonIndexDisplay
    }
  }

  static #getAsset(post: Post) {
    if (!post.thumbnails?.length && !post.assets?.length) return null

    if (post.thumbnails?.length) {
      return AssetVM.get(post.thumbnails.at(0)!)
    }
    
    return AssetVM.get(post.assets.at(0)!)
  }
}
