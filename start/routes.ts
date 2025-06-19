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
import router from '@adonisjs/core/services/router'
import { middleware } from './kernel.js'
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

/* eslint-disable */

router.where('id', router.matchers.number())
router.where('slug', router.matchers.slug())

//* General
router.get('/', [RenderHome]).as('home')
router.get('/frags/*', [RenderFrag]).as('frag')

//* Syndication
router.get('/rss', [RenderRssXml]).as('rss')
router.get('/sitemap', [RenderSitemap]).as('sitemap')
router.get('/sitemap.xml', [RenderSitemapXml]).as('sitemap.xml')

//* Go
router.get('/go/:entity/:entityId/:target/:targetId', [GoToNotification]).as('go.notification')

//* Assets
router.get('/img/:userId/:filename', [ShowAsset]).as('assets.img.user')
router.get('/img/*', [ShowAsset]).as('assets.img')
router.post('/api/image/upload', [StoreAsset]).as('assets.img.store').use(middleware.auth())

//* Auth
router.get('/signin', [RenderSignInPage]).as('auth.signin')
router.get('/signup', [RenderSignUpPage]).as('auth.signup')
router.post('/sessions', [StoreSessionSignIn]).as('auth.sessions.store')
router.delete('/sessions', [DestroySession]).as('auth.sessions.destroy')

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
router.get('/:handle/:tab?', [RenderUserProfile]).as('users.profile').where('handle', /^@/)

//* Series
router.get('/series', [RenderSeriesIndex]).as('series.index')
router.get('/series/:slug', [RenderSeriesShow]).as('series.show')
router.patch('/series/:slug/watchlist', [ToggleSeriesWatchlist]).as('series.watchlist')
router.get('/series/:series/lessons/:slug', [RenderLessonShow]).as('series.lessons.show')

//* Topics
router.get('/topics', [RenderTopicsIndex]).as('topics.index')
router.get('/topics/:slug', [RenderTopicShow]).as('topics.show')
router.get('/topics/:slug/series', [RenderTopicShowSeries]).as('topics.show.series')
router.get('/topics/:slug/discussions', [RenderTopicShowDiscussions]).as('topics.show.discussions')
router.get('/topics/:slug/lessons', [RenderTopicShowLessons]).as('topics.show.lessons')
router.get('/topics/:slug/snippets', [RenderTopicShowSnippets]).as('topics.show.snippets')

//* Lessons
router.get('/lessons', [RenderLessonsIndex]).as('lessons.index')
router.get('/lessons/:slug', [RenderLessonShow]).as('lessons.show')
router.get('/streams/:slug', [RenderLessonShow]).as('streams.show')

//* Blogs
router.get('/blog', [RenderBlogsIndex]).as('blogs.index')
router.get('/blog/:slug', [RenderBlogsShow]).as('blogs.show')
router.get('/news/:slug', [RenderBlogsShow]).as('news.show')

//* Snippets
router.get('/snippets', [RenderSnippetsIndex]).as('snippets.index')
router.get('/snippets/:slug', [RenderSnippetsShow]).as('snippets.show')

//* Discussions
router.get('/forum', [RenderDiscussionsIndex]).as('discussions.index')
router.get('/forum/create', [RenderDiscussionsCreate]).as('discussions.create')
router.post('/forum', [StoreDiscussion]).as('discussions.store')
router.get('/forum/:slug', [RenderDiscussionsShow]).as('discussions.show')
router.get('/forum/:slug/edit', [RenderDiscussionsEdit]).as('discussions.edit')
router.put('/forum/:slug', [UpdateDiscussion]).as('discussions.update')
router.patch('/forum/:id/vote', [ToggleDiscussionVote]).as('discussions.vote')
router.patch('/forum/:slug/solved', [ToggleDiscussionSolvedAt]).as('discussions.solved')
router.delete('/forum/:slug', [DestroyDiscussion]).as('discussions.destroy')

//* Comments
router.post('/comments', [StoreComment]).as('comments.store')
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
router.put('/settings/notifications', [UpdateUserNotifications]).as('settings.notifications').use(middleware.auth())
router.delete('/settings/session/:id?', [ForceSignOut]).as('settings.session.destroy').use(middleware.auth())
router.delete('/settings/account', [DestroyAccount]).as('settings.account.destroy').use(middleware.auth())
