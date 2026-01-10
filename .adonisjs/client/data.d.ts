/// <reference path="./manifest.d.ts" />
import type { InferData, InferVariants } from '@adonisjs/core/types/transformers'
import type { InferSharedProps } from '@adonisjs/inertia/types'
import type AssetTransformer from '#transformers/asset_transformer'
import type CollectionTransformer from '#transformers/collection_transformer'
import type CommentTransformer from '#transformers/comment_transformer'
import type DiscussionTransformer from '#transformers/discussion_transformer'
import type ModuleTransformer from '#transformers/module_transformer'
import type PlanTransformer from '#transformers/plan_transformer'
import type PostCaptionTransformer from '#transformers/post_caption_transformer'
import type PostChapterTransformer from '#transformers/post_chapter_transformer'
import type PostTransformer from '#transformers/post_transformer'
import type ProgressTransformer from '#transformers/progress_transformer'
import type TaxonomyTransformer from '#transformers/taxonomy_transformer'
import type TestimonialTransformer from '#transformers/testimonial_transformer'
import type UserTransformer from '#transformers/user_transformer'
import type InertiaMiddleware from '#middleware/inertia_middleware'

export namespace Data {
  export type Asset = InferData<AssetTransformer>
  export namespace Asset {
    export type Variants = InferVariants<AssetTransformer>
  }
  export type Collection = InferData<CollectionTransformer>
  export namespace Collection {
    export type Variants = InferVariants<CollectionTransformer>
  }
  export type Comment = InferData<CommentTransformer>
  export namespace Comment {
    export type Variants = InferVariants<CommentTransformer>
  }
  export type Discussion = InferData<DiscussionTransformer>
  export namespace Discussion {
    export type Variants = InferVariants<DiscussionTransformer>
  }
  export type Module = InferData<ModuleTransformer>
  export namespace Module {
    export type Variants = InferVariants<ModuleTransformer>
  }
  export type Plan = InferData<PlanTransformer>
  export namespace Plan {
    export type Variants = InferVariants<PlanTransformer>
  }
  export type PostCaption = InferData<PostCaptionTransformer>
  export namespace PostCaption {
    export type Variants = InferVariants<PostCaptionTransformer>
  }
  export type PostChapter = InferData<PostChapterTransformer>
  export namespace PostChapter {
    export type Variants = InferVariants<PostChapterTransformer>
  }
  export type Post = InferData<PostTransformer>
  export namespace Post {
    export type Variants = InferVariants<PostTransformer>
  }
  export type Progress = InferData<ProgressTransformer>
  export namespace Progress {
    export type Variants = InferVariants<ProgressTransformer>
  }
  export type Taxonomy = InferData<TaxonomyTransformer>
  export namespace Taxonomy {
    export type Variants = InferVariants<TaxonomyTransformer>
  }
  export type Testimonial = InferData<TestimonialTransformer>
  export namespace Testimonial {
    export type Variants = InferVariants<TestimonialTransformer>
  }
  export type User = InferData<UserTransformer>
  export namespace User {
    export type Variants = InferVariants<UserTransformer>
  }
  export type SharedProps = InferSharedProps<InertiaMiddleware>
}
