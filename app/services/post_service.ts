import PostBuilder from "#builders/post_builder";
import PostTypes from "#enums/post_types";

export default class PostService {
  public async getLatest(limit: number = 10, excludeIds: number[] = [], postTypeIds: PostTypes[] | PostTypes | null = null) {
    return PostBuilder.new()
      .if(excludeIds, builder => builder.exclude(excludeIds))
      .if(postTypeIds, builder => builder.whereType(postTypeIds!))
      .display()
      .orderPublished()
      .limit(limit)
  }

  public async getLatestLessons(limit: number = 10, excludeIds: number[] = []) {
    return this.getLatest(limit, excludeIds, [PostTypes.LESSON, PostTypes.LIVESTREAM])
  }
}