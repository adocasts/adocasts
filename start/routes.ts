/*
|--------------------------------------------------------------------------
| Routes file
|--------------------------------------------------------------------------
|
| The routes file is used for defining the HTTP routes.
|
*/

const RenderHome = () => import('../app/actions/general/render_home.js')
const RenderSeriesIndex = () => import('../app/actions/collections/render_series_index.js')
const RenderSeriesShow = () => import('../app/actions/collections/render_series_show.js')
const RenderTopicsIndex = () => import('#actions/taxonomies/render_topics_index')
const RenderTopicShow = () => import('#actions/taxonomies/render_topic_show')
const RenderLessonsIndex = () => import('../app/actions/posts/render_lessons_index.js')
const RenderLessonShow = () => import('../app/actions/posts/render_lessons_show.js')
const RenderSignInPage = () => import('../app/actions/auth/render_signin_page.js')
const RenderUserMenu = () => import('../app/actions/users/render_user_menu.js')
const DestroySession = () => import('../app/actions/auth/destroy_session.js')
const RenderSignUpPage = () => import('../app/actions/auth/render_signup_page.js')
const StoreSessionSignIn = () => import('../app/actions/auth/store_session_signin.js')
const ShowAsset = () => import('../app/actions/assets/show_asset.js')
const StoreAsset = () => import('../app/actions/assets/store_asset.js')
const StoreComment = () => import('../app/actions/comments/store_comment.js')
const ToggleCommentVote = () => import('../app/actions/comments/toggle_comment_vote.js')
const DestroyComment = () => import('../app/actions/comments/destroy_comment.js')
const UpdateComment = () => import('../app/actions/comments/update_comment.js')
const RenderDiscussionsIndex = () => import('#actions/discussions/render_discussions_index')
const RenderDiscussionsShow = () => import('#actions/discussions/render_discussions_show')
const ToggleDiscussionVote = () => import('#actions/discussions/toggle_discussion_vote')
const GoToNotification = () => import('#actions/notifications/goto_notification')
const RenderFrag = () => import('#actions/general/render_frag')
const ToggleSeriesWatchlist = () => import('#actions/collections/toggle_series_watchlist')
const RenderTopicShowSeries = () => import('#actions/taxonomies/render_topic_show_series')
const RenderTopicShowDiscussions = () => import('#actions/taxonomies/render_topic_show_discussions')
const RenderTopicShowLessons = () => import('#actions/taxonomies/render_topic_show_lessons')
const RenderBlogsIndex = () => import('#actions/posts/render_blogs_index')
const RenderBlogsShow = () => import('#actions/posts/render_blogs_show')
const StoreDiscussion = () => import('#actions/discussions/store_discussion')
const RenderDiscussionsCreate = () => import('#actions/discussions/render_discussions_create')
const HandleAllyCallback = () => import('#actions/auth/social/handle_ally_callback')
const HandleAllyRedirect = () => import('#actions/auth/social/handle_ally_redirect')
const HandleAllyUnlink = () => import('#actions/auth/social/handle_ally_unlink')
const RenderRssXml = () => import('#actions/syndication/render_rss_xml')
const RenderSitemapXml = () => import('#actions/syndication/render_sitemap_xml')
const RenderSitemap = () => import('#actions/syndication/render_sitemap')
const SendEmailVerification = () => import('#actions/users/send_email_verification')
const VerifyEmail = () => import('#actions/users/verify_email')
const RenderUserHistory = () => import('#actions/users/render_user_history')
import '#start/router/actions'
import { Exception } from '@adonisjs/core/exceptions'
import app from '@adonisjs/core/services/app'
import router from '@adonisjs/core/services/router'
import { middleware } from './kernel.js'
import {
  throttleComments,
  throttleCommentsBurst,
  throttleDiscussions,
  throttleDiscussionsBurst,
  throttleImageUpload,
  throttleSignUp,
  throttleVerifyEmail,
} from './limiter.js'
const TogglePostTranscript = () => import('#actions/posts/toggle_post_transcript')
const PatchUserPreferences = () => import('#actions/users/patch_user_preferences')
const RenderOgImage = () => import('#actions/general/render_og_image')
const RenderSearch = () => import('#actions/general/render_search')
const RenderPricing = () => import('#actions/general/render_pricing')
const DisableNotification = () => import('#actions/notifications/disable_notification')
const DisableAllNotifications = () => import('#actions/notifications/disable_all_notifications')
const StoreSessionSignUp = () => import('#actions/auth/store_session_signup')
const UpdateUserTheme = () => import('#actions/users/update_user_theme')
const SendContactEmail = () => import('#actions/general/send_contact_email')
const HandleStripeWebhook = () => import('#actions/plus/handle_stripe_webhook')
const HandleStripeCheckoutSuccess = () => import('#actions/plus/handle_stripe_checkout_success')
const RedirectStripeCheckout = () => import('#actions/plus/redirect_stripe_checkout')
const RedirectStripePortal = () => import('#actions/plus/redirect_stripe_portal')
const StoreProgress = () => import('#actions/progress/store_progress')
const ToggleProgressCompletion = () => import('#actions/progress/toggle_progress_completion')
const TogglePostAutoplay = () => import('#actions/posts/toggle_post_autoplay')
const TogglePostWatchlist = () => import('#actions/posts/toggle_post_watchlist')
const RenderUserBookmarks = () => import('#actions/users/render_user_bookmarks')
const RenderUserWatchlist = () => import('#actions/users/render_user_watchlist')
const DestroyAccount = () => import('#actions/users/destroy_account')
const UpdateUserBillTo = () => import('#actions/users/update_user_billto')
const RenderUserInvoice = () => import('#actions/users/render_user_invoice')
const UpdateUserNotifications = () => import('#actions/users/update_user_notifications')
const UpdateUserProfile = () => import('#actions/users/update_user_profile')
const UpdateUserPreferences = () => import('#actions/users/update_user_preferences')
const ForceSignOut = () => import('#actions/auth/force_signout')
const RenderForgotPassword = () => import('#actions/auth/password/render_forgot_password')
const RenderForgotPasswordSent = () => import('#actions/auth/password/render_forgot_password_sent')
const SendForgotPassword = () => import('#actions/auth/password/send_forgot_password')
const RenderResetPassword = () => import('#actions/auth/password/render_reset_password')
const ResetPassword = () => import('#actions/auth/password/reset_password')
const UpdateUsername = () => import('#actions/users/update_username')
const UpdateEmail = () => import('#actions/users/update_email')
const RevertEmail = () => import('#actions/users/revert_email')
const RenderUserSettings = () => import('#actions/users/render_user_settings')
const RenderUserProfile = () => import('#actions/users/render_user_profile')
const RenderTopicShowSnippets = () => import('#actions/taxonomies/render_topic_show_snippets')
const RenderSnippetsShow = () => import('#actions/posts/render_snippets_show')
const RenderSnippetsIndex = () => import('#actions/posts/render_snippets_index')
const ToggleDiscussionSolvedAt = () => import('#actions/discussions/toggle_discussion_solved_at')
const DestroyDiscussion = () => import('#actions/discussions/destroy_discussion')
const UpdateDiscussion = () => import('#actions/discussions/update_discussion')
const RenderDiscussionsEdit = () => import('#actions/discussions/render_discussions_edit')
const RenderSchedule = () => import('#actions/general/render_schedule')

/* eslint-disable */

router.useActionHandlers()

router.where('id', router.matchers.number())
router.where('slug', router.matchers.slug())

//* Redirects
router.on('/credits').redirectToPath('/uses')
router.on('/attributions').redirect('/uses')
router.on('/topics/adonisjs-5').redirectToPath('/topics/adonisjs')
router.on('/topics/adonis-5').redirectToPath('/topics/adonisjs')
router.on('/series/lets-learn-adonis-5').redirectToPath('/series/lets-learn-adonisjs-5')

if (app.inDev) {
  router.get('/exception/:status', (ctx) => {
    throw new Exception('This is an example exception page.', {
      code: 'E_EXAMPLE',
      status: ctx.params.status || 500,
    })
  })
}

//* General
router.get('/', [RenderHome]).as('home')
router.get('/schedule/:year?/:month?', [RenderSchedule]).as('schedules.index').where('year', router.matchers.number()).where('month', router.matchers.number())
router.get('/pricing', [RenderPricing]).as('pricing')
router.get('/search/:feed?', [RenderSearch]).as('search')
router.get('/og-image/:entity?/:slug?', [RenderOgImage]).as('og.img')
router.post('/contact', [SendContactEmail]).as('contact.send').use(middleware.turnstile())
router.on('/contact').render('pages/contact').as('contact')
router.on('/terms').render('pages/policies/terms').as('terms')
router.on('/privacy').render('pages/policies/privacy').as('privacy')
router.on('/cookies').render('pages/policies/cookies').as('cookies')
router.on('/guidelines').render('pages/policies/guidelines').as('guidelines')
router.on('/uses').render('pages/uses').as('uses')
router.get('/frags/*', [RenderFrag]).as('frag')

//* Syndication
router.get('/rss', [RenderRssXml]).as('rss')
router.get('/sitemap', [RenderSitemap]).as('sitemap')
router.get('/sitemap.xml', [RenderSitemapXml]).as('sitemap.xml')

//* Stripe
router.post('/stripe/webhook', [HandleStripeWebhook])
router.get('/stripe/subscription/success', [HandleStripeCheckoutSuccess]).as('stripe.success')
router.post('/stripe/subscription/checkout/:slug', [RedirectStripeCheckout]).as('stripe.checkout').use(middleware.auth())
router.post('/stripe/subscription/portal', [RedirectStripePortal]).as('stripe.portal').use(middleware.auth())

//* Go
router.get('/go/:entity/:entityId/:target/:targetId', [GoToNotification]).as('go.notification')

//* Assets
router.get('/img/:userId/:filename', [ShowAsset]).as('assets.img.user')
router.get('/img/*', [ShowAsset]).as('assets.img')
router.post('/api/image/upload', [StoreAsset]).as('assets.img.store').use([middleware.auth(), throttleImageUpload])

//* Auth
router.get('/signin', [RenderSignInPage]).as('auth.signin').use(middleware.guest())
router.get('/signup', [RenderSignUpPage]).as('auth.signup').use(middleware.guest())
router.post('/signin', [StoreSessionSignIn]).as('auth.signin.store').use(middleware.guest())
router.post('/signup', [StoreSessionSignUp]).as('auth.signup.store').use([middleware.guest(), middleware.turnstile(), throttleSignUp])
router.delete('/signout', [DestroySession]).as('auth.sessions.destroy')

//* Auth Social
router.get('/:provider/redirect', [HandleAllyRedirect]).as('auth.social.redirect')
router.get('/:provider/callback', [HandleAllyCallback]).as('auth.social.callback')
router.get('/:provider/unlink', [HandleAllyUnlink]).as('auth.social.unlink').use(middleware.auth())

//* Password Reset
router.get('/forgot-password', [RenderForgotPassword]).as('auth.password.forgot')
router.get('/forgot-password/sent', [RenderForgotPasswordSent]).as('auth.password.forgot.sent')
router.post('/forgot-password', [SendForgotPassword]).as('auth.password.forgot.send').use(middleware.turnstile())
router.get('/reset-password/:email', [RenderResetPassword]).as('auth.password.reset')
router.post('/reset-password', [ResetPassword]).as('auth.password.reset.store')

//* Users
router.get('/users/menu', [RenderUserMenu]).as('users.menu')
router.get('/users/watchlist', [RenderUserWatchlist]).as('users.watchlist').use(middleware.auth())
router.get('/users/bookmarks', [RenderUserBookmarks]).as('users.bookmarks').use(middleware.auth())
router.get('/users/history/:tab?', [RenderUserHistory]).as('users.history').use(middleware.auth())
router.get('/:handle/:tab?', [RenderUserProfile]).as('users.profile').where('handle', /^@/)
router.patch('/users/theme', [UpdateUserTheme]).as('users.theme')
router.get('/users/:userId/notifications/:field/off', [DisableNotification]).as('users.notifications.disable.field')
router.get('/users/:userId/notifications/off', [DisableAllNotifications]).as('users.notifications.disable')

//* Series
router.get('/series', [RenderSeriesIndex]).as('series.index')
router.get('/series/:slug', [RenderSeriesShow]).as('series.show')
router.patch('/series/:slug/watchlist', [ToggleSeriesWatchlist]).as('series.watchlist')
router.get('/series/:series/lessons/:slug', [RenderLessonShow]).as('series.lessons.show').use(middleware.postTypeCheck())
router.get('/series/:series/streams/:slug', [RenderLessonShow]).as('series.streams.show').use(middleware.postTypeCheck())

//* Topics
router.get('/topics', [RenderTopicsIndex]).as('topics.index')
router.get('/topics/:slug', [RenderTopicShow]).as('topics.show')
router.get('/topics/:slug/series', [RenderTopicShowSeries]).as('topics.show.series')
router.get('/topics/:slug/discussions', [RenderTopicShowDiscussions]).as('topics.show.discussions')
router.get('/topics/:slug/lessons', [RenderTopicShowLessons]).as('topics.show.lessons')
router.get('/topics/:slug/snippets', [RenderTopicShowSnippets]).as('topics.show.snippets')

//* Lessons
router.get('/lessons', [RenderLessonsIndex]).as('lessons.index')
router.patch('/lessons/:slug/watchlist', [TogglePostWatchlist]).as('lessons.watchlist').use(middleware.auth())
router.patch('/lessons/:slug/autoplay', [TogglePostAutoplay]).as('lessons.autoplay')
router.patch('/lessons/:slug/transcript', [TogglePostTranscript]).as('lessons.transcript')
router.get('/lessons/:slug', [RenderLessonShow]).as('lessons.show').use(middleware.postTypeCheck())
router.get('/streams/:slug', [RenderLessonShow]).as('streams.show').use(middleware.postTypeCheck())

//* Blogs
router.get('/blog', [RenderBlogsIndex]).as('blogs.index')
router.get('/blog/:slug', [RenderBlogsShow]).as('blogs.show').use(middleware.postTypeCheck())
router.get('/news/:slug', [RenderBlogsShow]).as('news.show').use(middleware.postTypeCheck())

//* Snippets
router.get('/snippets', [RenderSnippetsIndex]).as('snippets.index')
router.get('/snippets/:slug', [RenderSnippetsShow]).as('snippets.show').use(middleware.postTypeCheck())

//* Discussions
router.get('/forum', [RenderDiscussionsIndex]).as('discussions.index')
router.get('/forum/create', [RenderDiscussionsCreate]).as('discussions.create')
router.post('/forum', [StoreDiscussion]).as('discussions.store').use([throttleDiscussions, throttleDiscussionsBurst])
router.get('/forum/:slug', [RenderDiscussionsShow]).as('discussions.show')
router.get('/forum/:slug/edit', [RenderDiscussionsEdit]).as('discussions.edit')
router.put('/forum/:slug', [UpdateDiscussion]).as('discussions.update')
router.patch('/forum/:id/vote', [ToggleDiscussionVote]).as('discussions.vote')
router.patch('/forum/:slug/solved', [ToggleDiscussionSolvedAt]).as('discussions.solved')
router.delete('/forum/:slug', [DestroyDiscussion]).as('discussions.destroy')

//* Comments
router.post('/comments', [StoreComment]).as('comments.store').use([throttleComments, throttleCommentsBurst])
router.put('/comments/:id', [UpdateComment]).as('comments.update')
router.patch('/comments/:id/vote', [ToggleCommentVote]).as('comments.vote')
router.delete('/comments/:id', [DestroyComment]).as('comments.destroy')

//* Settings
router.get('/settings/:section?', [RenderUserSettings]).as('settings').use(middleware.auth())
router.get('/settings/invoices/:invoice', [RenderUserInvoice]).as('settings.invoice').use(middleware.auth())
router.patch('/settings/invoices/billto', [UpdateUserBillTo]).as('settings.invoice.billto').use(middleware.auth())
router.patch('/settings/username', [UpdateUsername]).as('settings.username').use(middleware.auth())
router.put('/settings/email', [UpdateEmail]).as('settings.email').use(middleware.auth())
router.get('/settings/revert/:id/:oldEmail/:newEmail', [RevertEmail]).as('settings.revert.email')
router.put('/settings/profile', [UpdateUserProfile]).as('settings.profile').use(middleware.auth())
router.put('/settings/preferences', [UpdateUserPreferences]).as('settings.preferences').use(middleware.auth())
router.patch('/settings/preferences/:preference', [PatchUserPreferences]).as('settings.preferences.patch').use(middleware.auth())
router.put('/settings/notifications', [UpdateUserNotifications]).as('settings.notifications').use(middleware.auth())
router.delete('/settings/session/:id?', [ForceSignOut]).as('settings.session.destroy').use(middleware.auth())
router.delete('/settings/account', [DestroyAccount]).as('settings.account.destroy').use(middleware.auth())

//* Email Verification
router.post('/verification/email/send', [SendEmailVerification]).as('verification.email.send').use([middleware.auth(), throttleVerifyEmail])
router.get('/verification/email/:email', [VerifyEmail]).as('verification.email.verify')

//* Progression
router.post('/progress', [StoreProgress]).as('progress.store')
router.patch('/progress/toggle', [ToggleProgressCompletion]).as('progress.toggle').use(middleware.auth())
