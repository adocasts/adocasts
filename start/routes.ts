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
import './router/actions.ts'
import { actions } from '#generated/actions'

router.useActionHandlers()

router.on('/').renderInertia('home', {}).as('home')

// AUTH
router.get('signup', [controllers.NewAccount, 'create']).use(middleware.guest()).as('new_account.create')
router.post('signup', [controllers.NewAccount, 'store']).use(middleware.guest()).as('new_account.store')
router.get('signin', [actions.auth.RenderSigninPage]).use(middleware.guest()).as('session.create')
router.post('signin', [actions.auth.StoreSessionSignin]).use(middleware.guest()).as('session.store')
router.post('logout', [controllers.Session, 'destroy']).use(middleware.auth()).as('session.destroy')

// SERIES
router.get('/series', [controllers.Series, 'index']).as('series.index')
