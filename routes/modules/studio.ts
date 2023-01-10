import Route from '@ioc:Adonis/Core/Route'

Route.group(() => {

  Route.group(() => {

    Route.get('/:postTypeId?',  'PostsController.index').as('index').where('postTypeId', Route.matchers.number())
    Route.get('/create',        'PostsController.create').as('create')
    Route.post('/',             'PostsController.store').as('store')
    Route.get('/:id/edit',      'PostsController.edit').as('edit')
    Route.put('/:id',           'PostsController.update').as('update')
    Route.delete('/:id',        'PostsController.destroy').as('destroy')

  }).prefix('/posts').as('posts').middleware(['role:admin'])

  Route.group(() => {

    Route.get('/',          'CollectionsController.index').as('index')
    Route.get('/create',    'CollectionsController.create').as('create')
    Route.post('/',         'CollectionsController.store').as('store')
    Route.get('/:id/edit',  'CollectionsController.edit').as('edit')
    Route.put('/:id',       'CollectionsController.update').as('update')
    Route.delete('/:id',    'CollectionsController.destroy').as('destroy')

  }).prefix('/collections').as('collections').middleware(['role:admin'])

  Route.group(() => {

    Route.get('/',          'TaxonomiesController.index').as('index')
    Route.get('/create',    'TaxonomiesController.create').as('create')
    Route.post('/',         'TaxonomiesController.store').as('store')
    Route.get('/:id/edit',  'TaxonomiesController.edit').as('edit')
    Route.put('/:id',       'TaxonomiesController.update').as('update')
    Route.delete('/:id',    'TaxonomiesController.destroy').as('destroy')

  }).prefix('/taxonomies').as('taxonomies').middleware(['role:admin'])

  Route.group(() => {

    Route.get('/:stateId?', 'CommentsController.index').as('index')
    Route.patch('/:id/state/:stateId', 'CommentsController.state').as('state').where('stateId', Route.matchers.number())

  }).prefix('/comments').as('comments')

  Route.group(() => {

    Route.get('/', 'BlocksController.index').as('index')
    Route.get('/create', 'BlocksController.create').as('create')

  }).prefix('/blocked').as('blocked').middleware(['role:admin'])

  Route.group(() => {

    Route.get('/', 'SettingsController.index').as('index')
    Route.patch('/username', 'SettingsController.usernameUpdate').as('username.update')
    Route.post('/username/unique', 'SettingsController.usernameUnique').as('username.unique')
    Route.put('/email', 'SettingsController.emailUpdate').as('email')
    Route.put('/email/notifications', 'SettingsController.emailNotificationUpdate').as('email.notifications')
    Route.get('/email/undo/:id/:oldEmail/:newEmail', 'SettingsController.emailRevert').as('email.undo')
    Route.post('/account/delete', 'SettingsController.deleteAccount').as('account.delete')

    Route.post('/cache/purge', 'SettingsController.purgeCache').as('cache.purge').middleware(['role:admin'])

  }).prefix('/settings').as('settings')

}).namespace('App/Controllers/Http/Studio').prefix('studio').as('studio').middleware(['auth'])