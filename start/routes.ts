/*
|--------------------------------------------------------------------------
| Routes file
|--------------------------------------------------------------------------
|
| The routes file is used for defining the HTTP routes.
|
*/

import { middleware } from '#start/kernel'
import { controllers } from '#generated/controllers'
import router from '@adonisjs/core/services/router'

router.on('/').renderInertia('home', {}).as('home')

// AUTH
router.get('signup', [controllers.NewAccount, 'create']).use(middleware.guest())
router.post('signup', [controllers.NewAccount, 'store']).use(middleware.guest())
router.get('signin', [controllers.Session, 'create']).use(middleware.guest())
router.post('signin', [controllers.Session, 'store']).use(middleware.guest())
router.post('logout', [controllers.Session, 'destroy']).use(middleware.auth())

// SERIES
router.get('/series', [controllers.Series, 'index'])
