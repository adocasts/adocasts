/*
|--------------------------------------------------------------------------
| Routes
|--------------------------------------------------------------------------
|
| This file is dedicated for defining HTTP routes. A single file is enough
| for majority of projects, however you can define routes in different
| files and just make sure to import them inside this file. For example
|
| Define routes in following two files
| ├── start/routes/cart.ts
| ├── start/routes/customer.ts
|
| and then import them inside `start/routes.ts` as follows
|
| import './routes/cart'
| import './routes/customer''
|
*/

import Route from '@ioc:Adonis/Core/Route'

/**
 * auth
 */
Route.get('/signin', 'AuthController.signin').as('auth.signin')
Route.post('/signin', 'AuthController.authenticate').as('auth.authenticate')
Route.get('/signup', 'AuthController.signup').as('auth.signup')
Route.post('/signup', 'AuthController.register').as('auth.register')
Route.post('/signout', 'AuthController.signout').as('auth.signout')


/**
 * auth social
 */
Route.get('/:provider/redirect', 'AuthSocialController.redirect').as('auth.social.redirect')
Route.get('/:provider/callback', 'AuthSocialController.callback').as('auth.social.callback')



/**
 * email verification
 */
Route.post('/verification/email/send', 'EmailVerificationController.send').as('verification.email.send').middleware(['auth'])
Route.get('/verification/email/:email', 'EmailVerificationController.verify').as('verification.email.verify')



/**
 * user settings
 */
Route.get('/users/settings', 'UserSettingsController.index').as('users.settings.index').middleware(['auth'])
Route.patch('/users/update/username', 'UserSettingsController.updateUsername').as('users.update.username').middleware(['auth'])



/**
 * images
 */
Route.get('/img/:userId/:filename', 'AssetsController.show').as('userimg');
Route.get('/img/*', 'AssetsController.show').where('path', /.*/).as('img');



/**
 * main pages
 */
Route.get('/', 'HomeController.index').as('home.index')
Route.get('/series', 'SeriesController.index').as('series.index')
Route.get('/series/:slug', 'SeriesController.show').as('series.show')
Route.get('/topics', 'TopicsController.index').as('topics.index')
Route.get('/topcis/:slug', 'TopicsController.show').as('topics.show')
Route.get('/lessons', 'LessonsController.index').as('lessons.index')
Route.get('/lessons/:slug', 'LessonsController.show').as('lessons.show')
Route.get('/streams', 'StreamsController.index').as('streams.index')
Route.get('/streams/:slug', 'StreamsController.show').as('streams.show')
Route.get('/news', 'NewsController.index').as('news.index')
Route.get('/news/:slug', 'NewsController.show').as('news.show')
Route.post('/comments', 'CommentsController.store').as('comments.store')
Route.put('/comments/:id', 'CommentsController.update').as('comments.update')
Route.patch('/comments/:id/like', 'CommentsController.like').as('comments.like')
Route.delete('/comments/:id', 'CommentsController.destroy').as('comments.destroy')
Route.get('/requests/lessons', 'LessonRequestsController.index').as('requests.lessons.index')
Route.get('/requests/lessons/create', 'LessonRequestsController.create').as('requests.lessons.create').middleware('auth')
Route.get('/requests/lessons/:id', 'LessonRequestsController.show').as('requests.lessons.show')
Route.post('/requests/lessons', 'LessonRequestsController.store').as('requests.lessons.store').middleware('auth')
Route.post('/requests/lessons/search', 'LessonRequestsController.search').as('requests.lessons.search')
Route.patch('/requests/lessons/:id/vote', 'LessonRequestsController.vote').as('requests.lessons.vote').middleware('auth')
Route.patch('/requests/lessons/:id/approve', 'LessonRequestsController.approve').as('requests.lessons.approve').middleware('auth')
Route.patch('/requests/lessons/:id/reject', 'LessonRequestsController.reject').as('requests.lessons.reject').middleware('auth')
Route.patch('/requests/lessons/:id/complete', 'LessonRequestsController.complete').as('requests.lessons.complete').middleware('auth')



/**
 * fragments, modals, drawers
 */
Route.get('/users/menu', 'UsersController.menu').as('users.menu')
Route.patch('/histories/progression/toggle', 'ProgressionsController.toggle').as('histories.progression.toggle')
Route.patch('/watchlist/:table/toggle', 'WatchlistsController.toggle').as('watchlists.toggle')
Route.get('/fragments/requests/lessons/:id/:fragment', 'LessonRequestsController.fragment').as('requests.lessons.fragment')
Route.get('/fragments/:fragment', 'FragmentsController.index').as('fragments.index')
Route.get('/fragments/:fragment/:id', 'FragmentsController.show').as('fragments.show')



/**
 * api
 */
Route.put('/api/user/theme', 'ThemesController.update').as('api.user.theme')



/**
 * go
 */
Route.get('/go/posts/:id/comment/:commentId', 'GoController.postComment').as('go.posts.comment')
Route.get('/go/requests/lessons/:id/comment/:commentId', 'GoController.lessonRequestComment').as('go.requests.lessons.comment')