/*
|--------------------------------------------------------------------------
| Routes file
|--------------------------------------------------------------------------
|
| The routes file is used for defining the HTTP routes.
|
*/

import router from '@adonisjs/core/services/router'
import { middleware } from './kernel.js'
const HomeController = () => import('#controllers/home_controller')
const ContactController = () => import('#controllers/contact_controller')
const SyndicationsController = () => import('#controllers/syndications_controller')
const CreditsController = () => import('#controllers/credits_controller')
const LegalsController = () => import('#controllers/legals_controller')
const StripeWebhooksController = () => import('#controllers/stripe_webhooks_controller')
const StripeSubscriptionsController = () => import('#controllers/stripe_subscriptions_controller')
const AssetsController = () => import('#controllers/assets_controller')
const AuthSignInController = () => import('#controllers/auth/sign_in_controller')
const AuthSignUpController = () => import('#controllers/auth/sign_up_controller')
const AuthSignOutController = () => import('#controllers/auth/sign_out_controller')
const AuthSocialController = () => import('#controllers/auth/social_controller')
const AuthPasswordResetController = () => import('#controllers/auth/password_reset_controller')
const UsersController = () => import('#controllers/users_controller')
const UserSettingsController = () => import('#controllers/user_settings_controller')
const PreferencesController = () => import('#controllers/preferences_controller')
const SessionsController = () => import('#controllers/sessions_controller')
const ProfilesController = () => import('#controllers/profiles_controller')
const EmailVerificationsController = () => import('#controllers/email_verifications_controller')
const TopicsController = () => import('#controllers/topics_controller')
const SeriesController = () => import('#controllers/series_controller')
const LessonsController = () => import('#controllers/lessons_controller')
const BlogsController = () => import('#controllers/blogs_controller')
const SnippetsController = () => import('#controllers/snippets_controller')
const WatchlistsController = () => import('#controllers/watchlists_controller')
const DiscussionsController = () => import('#controllers/discussions_controller')
const CommentsController = () => import('#controllers/comments_controller')
const ProgressionsController = () => import('#controllers/progressions_controller')
const SearchesController = () => import('#controllers/searches_controller')
const LessonRequestsController = () => import('#controllers/lesson_requests_controller')
const GoController = () => import('#controllers/go_controller')
const FragmentsController = () => import('#controllers/fragments_controller')

router.get('/img/:userId/:filename', [AssetsController, 'show']).as('userimg')
router.get('/img/*', [AssetsController, 'show']).where('path', /.*/).as('img')

router.get('/', [HomeController, 'index']).as('home')

/**
 * redirects
 */
router.on('/uses').redirectToPath('/credits')
router.on('/attributions').redirect('/credits')
router.on('/topics/adonisjs-5').redirectToPath('/topics/adonisjs')
router.on('/topics/adonis-5').redirectToPath('/topics/adonisjs')
router.on('/series/lets-learn-adonis-5').redirectToPath('/series/lets-learn-adonisjs-5')

/**
 * company routes
 */
router.get('/credits', [CreditsController, 'handle']).as('credits')
router.get('/pricing', [HomeController, 'pricing']).as('pricing')
router.get('/rss', [SyndicationsController, 'rss']).as('rss')
router.get('/sitemap', [SyndicationsController, 'sitemap']).as('sitemap')
router.get('/sitemap.xml', [SyndicationsController, 'xml']).as('sitemap.xml')
router.get('/contact', [ContactController, 'index']).as('contact.index')
router.post('/contact', [ContactController, 'store']).as('contact.store').use(middleware.turnstile())

/**
 * legal routes
 */
router.get('/cookies', [LegalsController, 'cookies']).as('legals.cookies')
router.get('/privacy', [LegalsController, 'privacy']).as('legals.privacy')
router.get('/terms', [LegalsController, 'terms']).as('legals.terms')
router.get('/guidelines', [LegalsController, 'guidelines']).as('legals.guidelines')

/**
 * stripe routes
*/
router.post('/stripe/webhook', [StripeWebhooksController, 'handle'])
router.get('/stripe/subscription/success', [StripeSubscriptionsController, 'success']).as('stripe.success')
router.post('/stripe/subscription/checkout/:slug', [StripeSubscriptionsController, 'checkout']).as('stripe.checkout').use(middleware.auth())
router.post('/stripe/subscription/portal', [StripeSubscriptionsController, 'portal']).as('stripe.portal').use(middleware.auth())

/**
 * sign up, in, out
 */
router.get('/signin', [AuthSignInController, 'create']).as('auth.signin.create').use(middleware.guest())
router.post('/signin', [AuthSignInController, 'store']).as('auth.signin.store').use(middleware.guest()).use(middleware.turnstile())
router.get('/signup', [AuthSignUpController, 'create']).as('auth.signup.create').use(middleware.guest())
router.post('/signup', [AuthSignUpController, 'store']).as('auth.signup.store').use(middleware.guest()).use(middleware.turnstile())
router.post('/signout', [AuthSignOutController, 'handle']).as('auth.signout')

/**
 * auth social
 */
router.get('/:provider/redirect', [AuthSocialController, 'redirect']).as('auth.social.redirect')
router.get('/:provider/callback', [AuthSocialController, 'callback']).as('auth.social.callback')
router.get('/:provider/unlink', [AuthSocialController, 'unlink']).as('auth.social.unlink').use(middleware.auth())

/**
 * password reset
 */
router.get('/forgot-password', [AuthPasswordResetController, 'forgotPassword']).as('auth.password.forgot');
router.get('/forgot-password/sent', [AuthPasswordResetController, 'forgotPasswordSent']).as('auth.password.forgot.sent')
router.post('/forgot-password', [AuthPasswordResetController, 'forgotPasswordSend']).as('auth.password.forgot.send').use(middleware.turnstile())
router.get('/reset-password/:email', [AuthPasswordResetController, 'resetPassword']).as('auth.password.reset');
router.post('/reset-password', [AuthPasswordResetController, 'resetPasswordStore']).as('auth.password.reset.store')

/**
 * email verification
 */
router.post('/verification/email/send', [EmailVerificationsController, 'send']).as('verification.email.send').use(middleware.auth())
router.get('/verification/email/:email', [EmailVerificationsController, 'verify']).as('verification.email.verify')

/**
 * users
 */
router.get('/:username', [ProfilesController, 'show']).as('profiles.show').where('username', /^@/)
router.get('/users/menu', [UsersController, 'menu']).as('users.menu').use(middleware.auth())
router.get('/users/watchlist/:tab?', [UsersController, 'watchlist']).as('users.watchlist').use(middleware.auth())
router.get('/users/history/:tab?', [UsersController, 'history']).as('users.history').use(middleware.auth())
router.put('/api/users/theme', [UsersController, 'theme']).as('api.users.theme')
router.get('/api/user/check', [UsersController, 'check']).as('api.user.check')
router.patch('/api/users/billto', [UsersController, 'billto']).as('api.users.billto').use(middleware.auth())

/**
 * user settings
 */
router.get('/settings/:section?', [UserSettingsController, 'index']).as('users.settings.index').use(middleware.auth())
router.get('/settings/invoices/:invoice', [UserSettingsController, 'invoice']).as('users.settings.invoice').use(middleware.auth())
router.patch('/users/update/username', [UserSettingsController, 'updateUsername']).as('users.update.username').use(middleware.auth())
router.put('/users/update/email', [UserSettingsController, 'updateEmail']).as('users.update.email').use(middleware.auth())
router.get('/users/revert/:id/:oldEmail/:newEmail', [UserSettingsController, 'revertEmail']).as('users.revert.email')
router.put('/users/notifications/email', [UserSettingsController, 'updateNotificationEmails']).as('users.notifications.email').use(middleware.auth())
router.put('/users/notifications/watchlist', [UserSettingsController, 'updateWatchlistNotificationEmails']).as('users.notifications.watchlist').use(middleware.auth())
router.get('/users/:userId/notifications/:field/off', [UserSettingsController, 'disableNotificationField']).as('users.notifications.disable.field')
router.get('/users/:userId/notifications/off', [UserSettingsController, 'disableNotifications']).as('users.notifications.disable')
router.delete('/users/delete', [UserSettingsController, 'deleteAccount']).as('users.destroy').use(middleware.auth())
router.put('/users/profile', [ProfilesController, 'update']).as('users.profiles.update').use(middleware.auth())
router.put('/users/preferences', [PreferencesController, 'update']).as('users.preferences.update').use(middleware.auth())
router.delete('/users/sessions/:id?', [SessionsController, 'destroy']).as('users.sessions.destroy').use(middleware.auth())

/**
 * watchlists
 */
router.patch('/watchlist/toggle', [WatchlistsController, 'toggle']).as('watchlists.toggle').use(middleware.auth())

/**
 * search
 */
router.get('/search', [SearchesController, 'index']).as('search.index')
router.post('/search', [SearchesController, 'search']).as('search.search')

/**
 * content
 */
router.get('/topics', [TopicsController, 'index']).as('topics.index')
router.get('/topics/:slug', [TopicsController, 'show']).as('topics.show')
router.get('/series', [SeriesController, 'index']).as('series.index')
router.get('/series/:slug', [SeriesController, 'show']).as('series.show')
router.get('/series/:slug/lesson/:index', [SeriesController, 'lesson']).as('series.lesson').where('index', router.matchers.number())
router.get('/series/:slug/continue', [SeriesController, 'continue']).as('series.continue')
router.get('/series/:collectionSlug/lessons/:slug', [LessonsController, 'show']).as('series.lessons.show').use(middleware.postTypeCheck())
router.get('/series/:collectionSlug/streams/:slug', [LessonsController, 'show']).as('series.streams.show').use(middleware.postTypeCheck())
router.get('/lessons', [LessonsController, 'index']).as('lessons.index')
router.get('/lessons/:slug', [LessonsController, 'show']).as('lessons.show').use(middleware.postTypeCheck())
router.get('/streams', [LessonsController, 'streams']).as('streams.index')
router.get('/streams/:slug', [LessonsController, 'show']).as('streams.show').use(middleware.postTypeCheck())
router.get('/blog', [BlogsController, 'index']).as('blog.index')
router.get('/blog/:slug', [LessonsController, 'show']).as('blog.show').use(middleware.postTypeCheck())
router.get('/news/:slug', [LessonsController, 'show']).as('news.show').use(middleware.postTypeCheck())
router.get('/snippets', [SnippetsController, 'index']).as('snippets.index')
router.get('/snippets/:slug', [LessonsController, 'show']).as('snippets.show').use(middleware.postTypeCheck())

/**
 * discussions
 */
router.get('/feed', [DiscussionsController, 'index']).as('feed.index')
router.get('/feed/create', [DiscussionsController, 'create']).as('feed.create')
router.post('/feed', [DiscussionsController, 'store']).as('feed.store')
router.get('/feed/:slug', [DiscussionsController, 'show']).as('feed.show')
router.get('/feed/:slug/edit', [DiscussionsController, 'edit']).as('feed.edit')
router.put('/feed/:id', [DiscussionsController, 'update']).as('feed.update')
router.delete('/feed', [DiscussionsController, 'destroy']).as('feed.destroy')

/**
 * comments
 */
router.post('/comments', [CommentsController, 'store']).as('comments.store')
router.put('/comments/:id', [CommentsController, 'update']).as('comments.update')
router.patch('/comments/:id/like', [CommentsController, 'like']).as('comments.like')
router.delete('/comments/:id', [CommentsController, 'destroy']).as('comments.destroy')

/**
 * progression
 */
router.post('/api/history/progression/:id?', [ProgressionsController, 'record']).as('api.histories.progression')
router.patch('/histories/progression/toggle', [ProgressionsController, 'toggle']).as('histories.progression.toggle')

/**
 * lesson requests
 */
router.get('/requests/lessons', [LessonRequestsController, 'index']).as('requests.lessons.index')
router.get('/requests/lessons/create', [LessonRequestsController, 'create']).as('requests.lessons.create').use(middleware.auth())
router.get('/requests/lessons/:id', [LessonRequestsController, 'show']).as('requests.lessons.show')
router.post('/requests/lessons', [LessonRequestsController, 'store']).as('requests.lessons.store').use(middleware.auth())
router.get('/requests/lessons/:id/edit', [LessonRequestsController, 'edit']).as('requests.lessons.edit')
router.put('/requests/lessons/:id', [LessonRequestsController, 'update']).as('requests.lessons.update').use(middleware.auth())
router.delete('/requests/lessons/:id', [LessonRequestsController, 'destroy']).as('requests.lessons.destroy').use(middleware.auth())
router.post('/requests/lessons/search', [LessonRequestsController, 'search']).as('requests.lessons.search')
router.patch('/requests/lessons/:id/vote', [LessonRequestsController, 'vote']).as('requests.lessons.vote').use(middleware.auth())
router.patch('/requests/lessons/:id/approve', [LessonRequestsController, 'approve']).as('requests.lessons.approve').use(middleware.auth())
router.patch('/requests/lessons/:id/reject', [LessonRequestsController, 'reject']).as('requests.lessons.reject').use(middleware.auth())
router.patch('/requests/lessons/:id/complete', [LessonRequestsController, 'complete']).as('requests.lessons.complete').use(middleware.auth())
router.get('/fragments/requests/lessons/:id/:fragment', [LessonRequestsController, 'fragment']).as('requests.lessons.fragment')

/**
 * go
 */
router.get('/go/posts/:id/comment/:commentId', [GoController, 'postComment']).as('go.posts.comment')
router.get('/go/post/:id/comment/:commentId', [GoController, 'postComment']).as('go.post.comment')
router.get('/go/requests/lessons/:id/comment/:commentId', [GoController, 'lessonRequestComment']).as('go.requests.lessons.comment')
router.get('/go/discussions/:id/comment/:commentId', [GoController, 'discussionComment']).as('go.discussions.comment')
router.get('/go/auth/reset', [GoController, 'authReset']).as('go.auth.reset')

/**
 * fragments
 */
router.get('/fragments/layout/header/notifications', [FragmentsController, 'headerNotifications']).as('fragments.header.notifications')