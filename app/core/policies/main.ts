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
  AdPolicy: () => import('#advertisement/policies/ad_policy'),
  AssetPolicy: () => import('#asset/policies/asset_policy'),
  CommentPolicy: () => import('#comment/policies/comment_policy'),
  PostPolicy: () => import('#post/policies/post_policy'),
  LessonRequestPolicy: () => import('#lesson_request/policies/lesson_request_policy'),
  DiscussionPolicy: () => import('#discussion/policies/discussion_policy'),
}
