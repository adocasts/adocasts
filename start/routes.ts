/*
|--------------------------------------------------------------------------
| Routes file
|--------------------------------------------------------------------------
|
| The routes file is used for defining the HTTP routes.
|
*/

const HomeController = () => import('#controllers/home_controller')
const SeriesController = () => import('#controllers/series_controller')
import router from '@adonisjs/core/services/router'

router.where('slug', router.matchers.slug())

router.get('/', [HomeController]).as('home')

//* Series
router.get('/series', [SeriesController, 'index']).as('series.index')
router.get('/series/:slug', [SeriesController, 'show']).as('series.show')
