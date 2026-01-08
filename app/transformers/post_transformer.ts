import type Post from '#models/post'
import { BaseTransformer } from '@adonisjs/core/transformers'
import AssetTransformer from './asset_transformer.ts'
import CollectionTransformer from './collection_transformer.ts'
import CommentTransformer from './comment_transformer.ts'
import PostCaptionTransformer from './post_caption_transformer.ts'
import PostChapterTransformer from './post_chapter_transformer.ts'
import UserTransformer from './user_transformer.ts'

export default class PostTransformer extends BaseTransformer<Post> {
  toObject() {
    const thumbnail = this.resource.thumbnails.at(0) || null
    return {
      ...this.pick(this.resource, [
        'id',
        'slug',
        'title',
        'description',
        'postTypeId',
        'paywallTypeId',
        'stateId',
        'publishAt',
        'routeUrl',
        'videoSeconds',
        'rootSortOrder',
        'animatedPreviewUrl',
        '$extras',
      ]),
      sortOrder: this.resource.$extras?.pivot_sort_order,
      series: CollectionTransformer.transform(this.resource.rootSeries),
      thumbnail: AssetTransformer.transform(this.whenLoaded(thumbnail)),
    }
  }

  show() {
    return {
      ...this.toObject(),
      ...this.pick(this.resource, [
        'videoTypeId',
        'videoUrl',
        'videoBunnyId',
        'videoYouTubeId',
        'videoR2Id',
        'videoId',
        'bunnyHlsUrl',
        'transcriptUrl',
        'hasVideo',
        'updatedContentAt',
        'repositoryUrl',
        'repositoryAccessLevel',
        'body',
        'livestreamUrl',
        'isLive',
        'lessonIndexDisplay',
        'rootIndexDisplay',
      ]),
      captions: PostCaptionTransformer.transform(this.resource.captions),
      chapters: PostChapterTransformer.transform(this.resource.chapters),
      comments: CommentTransformer.transform(this.resource.comments),
      author: UserTransformer.transform(this.resource.authors[0]),
    }
  }
}
