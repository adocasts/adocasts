/*
|--------------------------------------------------------------------------
| Routes file
|--------------------------------------------------------------------------
|
| The routes file is used for defining the HTTP routes.
|
*/

const RenderHome = () => import('#general/actions/render_home')
const RenderSeriesIndex = () => import('#collection/actions/render_series_index')
const RenderSeriesShow = () => import('#collection/actions/render_series_show')
const RenderTopicsIndex = () => import('#taxonomy/actions/render_topics_index')
const RenderTopicShow = () => import('#taxonomy/actions/render_topic_show')
const RenderDiscussionsIndex = () => import('#discussion/actions/render_discussions_index')
const RenderDiscussionsShow = () => import('#discussion/actions/render_discussions_show')
const RenderLessonsIndex = () => import('#post/actions/render_lessons_index')
const RenderLessonShow = () => import('#post/actions/render_lessons_show')
const RenderSignInPage = () => import('#auth/actions/render_signin_page')
const RenderUserMenu = () => import('#user/actions/render_user_menu')
const DestroySession = () => import('#auth/actions/destroy_session')
const RenderSignUpPage = () => import('#auth/actions/render_signup_page')
const StoreSessionSignIn = () => import('#auth/actions/store_session_signin')
import Test from '#pages/test'
import router from '@adonisjs/core/services/router'

router.get('/test', async ({ page }) => {
  return page(Test)
})

router.where('slug', router.matchers.slug())

router.get('/', [RenderHome]).as('home')

//* Auth
router.get('/signin', [RenderSignInPage]).as('auth.signin')
router.get('/signup', [RenderSignUpPage]).as('auth.signup')
router.post('/sessions', [StoreSessionSignIn]).as('auth.sessions.store')
router.delete('/sessions', [DestroySession]).as('auth.sessions.destroy')

//* User
router.get('/users/menu', [RenderUserMenu]).as('users.menu')

//* Series
router.get('/series', [RenderSeriesIndex]).as('series.index')
router.get('/series/:slug', [RenderSeriesShow]).as('series.show')
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
