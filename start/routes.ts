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
import router from '@adonisjs/core/services/router'
import { middleware } from './kernel.js'
const ToggleSeriesWatchlist = () => import('#actions/collections/toggle_series_watchlist')

router.where('id', router.matchers.number())
router.where('slug', router.matchers.slug())

router.get('/', [RenderHome]).as('home')

//* Assets
router.get('/img/:userId/:filename', [ShowAsset]).as('assets.img.user')
router.get('/img/*', [ShowAsset]).as('assets.img')
router.post('/api/image/upload', [StoreAsset]).as('assets.img.store').use(middleware.auth())

//* Auth
router.get('/signin', [RenderSignInPage]).as('auth.signin')
router.get('/signup', [RenderSignUpPage]).as('auth.signup')
router.post('/sessions', [StoreSessionSignIn]).as('auth.sessions.store')
router.delete('/sessions', [DestroySession]).as('auth.sessions.destroy')

//* Users
router.get('/users/menu', [RenderUserMenu]).as('users.menu')

//* Series
router.get('/series', [RenderSeriesIndex]).as('series.index')
router.get('/series/:slug', [RenderSeriesShow]).as('series.show')
router.patch('/series/:slug/watchlist', [ToggleSeriesWatchlist]).as('series.watchlist')
router.get('/series/:series/lessons/:slug', [RenderLessonShow]).as('series.lessons.show')

//* Topics
router.get('/topics', [RenderTopicsIndex]).as('topics.index')
router.get('/topics/:slug', [RenderTopicShow]).as('topics.show')

//* Lessons
router.get('/lessons', [RenderLessonsIndex]).as('lessons.index')
router.get('/lessons/:slug', [RenderLessonShow]).as('lessons.show')

//* Discussions
router.get('/forum', [RenderDiscussionsIndex]).as('discussions.index')
router.get('/forum/:slug', [RenderDiscussionsShow]).as('discussions.show')
router.patch('/forum/:id/vote', [ToggleDiscussionVote]).as('discussions.vote')

//* Comments
router.post('/comments', [StoreComment]).as('comments.store')
router.put('/comments/:id', [UpdateComment]).as('comments.update')
router.patch('/comments/:id/vote', [ToggleCommentVote]).as('comments.vote')
router.delete('/comments/:id', [DestroyComment]).as('comments.destroy')
