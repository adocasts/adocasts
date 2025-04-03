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
import router from '@adonisjs/core/services/router'

router.where('slug', router.matchers.slug())

router.get('/', [RenderHome]).as('home')

//* Series
router.get('/series', [RenderSeriesIndex]).as('series.index')
// router.get('/series/:slug', [SeriesController, 'show']).as('series.show')
