import Route from '@ioc:Adonis/Core/Route'

Route.group(() => {

  Route.post('/studio/assets', 'AssetsController.store').as('studio.assets.store')
  Route.delete('/studio/assets/:id', 'AssetsController.destroy').as('studio.assets.destroy')
  Route.post('/studio/editor/assets', 'AssetsController.store').as('studio.editor.asset')//.middleware(['admin'])

  Route.post('/watchlist',         'WatchlistsController.store').as('watchlist.store')
  Route.post('/watchlist/toggle',  'WatchlistsController.toggle').as('watchlist.toggle')
  Route.delete('/watchlist/:id',   'WatchlistsController.destroy').as('watchlist.destroy')

  Route.post('/notifications/read', 'NotificationsController.read').as('notifications.read')

  Route.post('/history/view', 'HistoriesController.view').as('histories.view')
  Route.post('/history/progression/toggle', 'HistoriesController.progressionToggle').as('histories.progression.toggle')
  Route.post('/history/progression/:id?', 'HistoriesController.progression').as('histories.progression')

  Route.post('/comments/:id/like', 'CommentsController.like').as('comments.like')

  Route.group(() => {

    Route.get('/posts/search', 'PostsController.search').as('posts.search')

    Route.post('/collections/stub', 'CollectionsController.stub').as('collections.stub')

  }).prefix('/studio').as('studio').namespace('App/Controllers/Http/Studio')

}).prefix('/api').as('api').middleware(['auth'])

Route.group(() => {

  Route.post('/session/set', async ({ request, response, session }) => {
    const { target, value } = request.body()
    await session.put(target, value)
    return response.status(204)
  }).as('session.set')

  Route.get('/users/theme/:theme', 'UsersController.theme').as('users.theme')

}).prefix('/api').as('api')