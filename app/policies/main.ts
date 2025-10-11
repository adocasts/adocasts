/*
|--------------------------------------------------------------------------
| Bouncer policies
|--------------------------------------------------------------------------
|
| You may define a collection of policies inside this file and pre-register
| them when creating a new bouncer instance.
|
| Pre-registered policies and abilities can be referenced as a string by their
| name. Also they are must if want to perform authorization inside Edge
| templates.
|
*/

export const policies = {
  NotePolicy: () => import('#policies/note_policy'),
  AdPolicy: () => import('#policies/ad_policy'),
  AssetPolicy: () => import('#policies/asset_policy'),
  CommentPolicy: () => import('#policies/comment_policy'),
  PostPolicy: () => import('#policies/post_policy'),
  LessonRequestPolicy: () => import('#policies/lesson_request_policy'),
  DiscussionPolicy: () => import('#policies/discussion_policy'),
  TestimonialPolicy: () => import('#policies/testimonial_policy'),
}
