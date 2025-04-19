/*
|--------------------------------------------------------------------------
| Routes file
|--------------------------------------------------------------------------
|
| The routes file is used for defining the HTTP routes.
|
*/

const RenderSeriesIndex = () => import('#collection/actions/render_series_index')
const RenderHome = () => import('#core/actions/render_home')
const RenderSeriesShow = () => import('#collection/actions/render_series_show')
const RenderTopicsIndex = () => import('#taxonomy/actions/render_topics_index')
const RenderTopicShow = () => import('#taxonomy/actions/render_topic_show')
const RenderDiscussionsIndex = () => import('#discussion/actions/render_discussions_index')
const RenderDiscussionsShow = () => import('#discussion/actions/render_discussions_show')
const RenderLessonsIndex = () => import('#post/actions/render_lessons_index')
import router from '@adonisjs/core/services/router'

router.where('slug', router.matchers.slug())

router.get('/', [RenderHome]).as('home')

//* Series
router.get('/series', [RenderSeriesIndex]).as('series.index')
router.get('/series/:slug', [RenderSeriesShow]).as('series.show')

//* Topics
router.get('/topics', [RenderTopicsIndex]).as('topics.index')
router.get('/topics/:slug', [RenderTopicShow]).as('topics.show')

//* Lessons
router.get('/lessons', [RenderLessonsIndex]).as('lessons.index')

//* Discussions
router.get('/forum', [RenderDiscussionsIndex]).as('discussions.index')
router.get('/forum/:slug', [RenderDiscussionsShow]).as('discussions.show')
