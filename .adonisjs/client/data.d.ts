/// <reference path="./manifest.d.ts" />
import type { InferData, InferVariants } from '@adonisjs/core/types/transformers'
import type { InferSharedProps } from '@adonisjs/inertia/types'
import type UserTransformer from '#transformers/user_transformer'
import type AssetTransformer from '#transformers/asset_transformer'
import type PostChapterTransformer from '#transformers/post_chapter_transformer'
import type PostCaptionTransformer from '#transformers/post_caption_transformer'
import type CommentTransformer from '#transformers/comment_transformer'
import type DiscussionTransformer from '#transformers/discussion_transformer'
import type InertiaMiddleware from '#middleware/inertia_middleware'

export namespace Data {
  export type User = InferData<UserTransformer>
  export namespace User {
    export type Variants = InferVariants<UserTransformer>
  }
  export type Asset = InferData<AssetTransformer>
  export namespace Asset {
    export type Variants = InferVariants<AssetTransformer>
  }
  export type PostChapter = InferData<PostChapterTransformer>
  export namespace PostChapter {
    export type Variants = InferVariants<PostChapterTransformer>
  }
  export type PostCaption = InferData<PostCaptionTransformer>
  export namespace PostCaption {
    export type Variants = InferVariants<PostCaptionTransformer>
  }
  export type Comment = InferData<CommentTransformer>
  export namespace Comment {
    export type Variants = InferVariants<CommentTransformer>
  }
  export type Discussion = InferData<DiscussionTransformer>
  export namespace Discussion {
    export type Variants = InferVariants<DiscussionTransformer>
  }
  export type SharedProps = InferSharedProps<InertiaMiddleware>
}
