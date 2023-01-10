import Route from '@ioc:Adonis/Core/Route'

import './modules/api'
import './modules/auth'
import './modules/studio'

Route.on('/guidelines').render('guidelines').as('guidelines')
Route.on('/cookies').render('cookies').as('cookies')
Route.on('/privacy').render('privacy').as('privacy')
Route.on('/terms').render('terms').as('terms')
Route.on('/uses').render('uses').as('uses')
Route.on('/resources').render('resources').as('resources')

Route.get('/', 'HomeController.index').as('home')
Route.get('/analytics', 'HomeController.analytics').as('analytics')

Route.get('/sitemap',     'SyndicationController.sitemap').as('sitemap')
Route.get('/sitemap.xml', 'SyndicationController.xml').as('sitemap.xml')
Route.get('/rss',         'SyndicationController.feed').as('rss')

Route.get('/contact', 'ContactController.index').as('contact.index')
Route.post('/contact', 'ContactController.contact').as('contact.post').middleware(['honeypot'])
Route.on('/support').redirect('contact.index')

Route.get('/search', 'HomeController.search').as('search')

Route.get('/faq', 'QuestionsController.index').as('questions.index')

Route.get('/img/:userId/:filename', 'AssetsController.show').as('userimg');
Route.get('/img/*', 'AssetsController.show').where('path', /.*/).as('img');

// PUBLIC -- Redirects from old
Route.on('/topics/adonisjs-5').redirectToPath('/topics/adonisjs')
Route.on('/topics/adonis-5').redirectToPath('/topics/adonisjs')
Route.on('/series/lets-learn-adonis-5').redirectToPath('/series/lets-learn-adonisjs-5')

// PUBLIC
Route.get('/series',                      'SeriesController.index').as('series.index')
Route.get('/series/:slug',                'SeriesController.show').as('series.show')
Route.get('/series/:slug/lesson/:index',  'SeriesController.lesson').as('series.lesson')

Route.get('/lessons',       'LessonsController.index').as('lessons.index')
Route.get('/lessons/:slug', 'LessonsController.show').as('lessons.show').middleware(['postTypeCheck'])

Route.get('/posts',         'PostsController.index').as('posts.index')
Route.get('/posts/:slug',   'PostsController.show').as('posts.show').middleware(['postTypeCheck'])

Route.get('/news',         'NewsController.index').as('news.index')
Route.get('/news/:slug',   'NewsController.show').as('news.show').middleware(['postTypeCheck'])

Route.get('/streams',       'LivestreamsController.index').as('livestreams.index')
Route.get('/streams/:slug', 'LivestreamsController.show').as('livestreams.show').middleware(['postTypeCheck'])

Route.get('/topics',        'TopicsController.index').as('topics.index')
Route.get('/topics/:slug',  'TopicsController.show').as('topics.show')

Route.post('/comments',       'CommentsController.store').as('comments.store').middleware(['honeypot'])
Route.put('/comments/:id',    'CommentsController.update').as('comments.update').middleware(['honeypot'])
Route.delete('/comments/:id', 'CommentsController.destroy').as('comments.destroy')

Route.get('/watchlist',       'WatchlistsController.index').as('watchlist.index')
Route.get('/progress',        'HistoriesController.progress').as('histories.progress')

Route.get('/user/menu', 'UsersController.menu').as('user.menu').middleware(['auth'])

// GO
Route.group(() => {

  Route.get('/post/:postId/comment/:commentId', 'GoController.comment').as('comment')

}).prefix('/go').as('go')

Route.get('/ping', async ({ response }) => {
  return response.status(200).json({ pong: true })
})

Route.get('/mastodon', ({ view }) => {
  return view.render('redirect', { 
    title: "Mastodon Redirect, Thanks Twitter!",
    desc: "We'll redirect you to our Mastodon account via this page, we're using our site as a middleman to comply with Twitter's weird new rules",
    go: 'https://fosstodon.org/@adocasts' 
  })
})

Route.get('/mastodon/tom', ({ view }) => {
  return view.render('redirect', { 
    title: "Mastodon Redirect, Thanks Twitter!",
    desc: "We'll redirect you to our Mastodon account via this page, we're using our site as a middleman to comply with Twitter's weird new rules",
    go: 'https://fosstodon.org/@tomgobich' 
  })
})