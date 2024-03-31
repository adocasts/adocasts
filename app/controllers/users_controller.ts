import HistoryBuilder from '#builders/history_builder'
import NotificationService from '#services/notification_service'
import { themeValidator } from '#validators/theme_validator'
import type { HttpContext } from '@adonisjs/core/http'
import Tab from '../view_models/tab.js'
import router from '@adonisjs/core/services/router'
import Collection from '#models/collection'
import Post from '#models/post'
import PostTypes from '#enums/post_types'
import CollectionBuilder from '#builders/collection_builder'
import PostBuilder from '#builders/post_builder'
import { billtoValidator, mentionListValidator } from '#validators/user_validator'
import User from '#models/user'
import ProgressBuilder from '#builders/progress_builder'

export default class UsersController {
  async menu({ view, auth }: HttpContext) {
    const notifications = await NotificationService.getForUser(auth.user)

    await NotificationService.markAsRead(notifications.unread)

    return view.render('pages/users/menu', { notifications })
  }

  async theme({ request, view, auth, session }: HttpContext) {
    const { theme } = await request.validateUsing(themeValidator)

    await auth.user?.merge({ theme }).save()

    session.put('theme', theme)

    return view.render('components/theme/selector')
  }

  async billto({ request, response, auth }: HttpContext) {
    let clearedBillTo = false
    let { billToInfo } = await request.validateUsing(billtoValidator)
    let user = auth.user!

    if (billToInfo === '\n') {
      billToInfo = null
      clearedBillTo = true
    }

    await user.merge({ billToInfo }).save()

    return response.status(200).json({ clearedBillTo, billToInfo })
  }

  async watchlist({ view, request, auth, params }: HttpContext) {
    const { page = 1 } = request.qs()

    const keys = {
      series: 'series',
      lessons: 'lessons',
      posts: 'posts',
    }

    const tab = params.tab || keys.series
    const tabs = Object.values(keys).map((key) => Tab.watchlist(key))
    const tabIndex = tabs.findIndex((_tab) => _tab.key === tab)
    const route = router.makeUrl('users.watchlist', { tab })

    let series: Collection[] | undefined
    let lessons: Post[] | undefined
    let posts: Post[] | undefined

    switch (tab) {
      case keys.series:
        series = await CollectionBuilder.new(auth.user)
          .series()
          .display()
          .whereInWatchlist()
          .withPosts('pivot_root_sort_order', 'desc', 3)
          .paginate(page, 15, route)
        break
      case keys.lessons:
        lessons = await PostBuilder.new(auth.user)
          .whereLesson()
          .whereInWatchlist()
          .display()
          .paginate(page, 15, route)
        break
      case keys.posts:
        const postTypes = [PostTypes.BLOG, PostTypes.LINK, PostTypes.NEWS, PostTypes.SNIPPET]
        posts = await PostBuilder.new(auth.user)
          .whereType(postTypes)
          .whereInWatchlist()
          .display()
          .paginate(page, 15, route)
        break
    }

    return view.render('pages/users/watchlist', { tab, tabs, tabIndex, series, lessons, posts })
  }

  async history({ view, request, auth, params }: HttpContext) {
    const { page = 1 } = request.qs()

    const keys = {
      series: 'series',
      lessons: 'lessons',
      posts: 'posts',
    }

    const tab = params.tab || keys.series
    const tabs = Object.values(keys).map((key) => Tab.history(key))
    const tabIndex = tabs.findIndex((_tab) => _tab.key === tab)
    const route = router.makeUrl('users.history', { tab })

    let series: Collection[] | undefined
    let lessons: Post[] | undefined
    let posts: Post[] | undefined

    switch (tab) {
      case keys.series:
        series = await ProgressBuilder.new(auth.user)
          .get()
          .collections((builder) => builder.series().display().paginate(page, 30, route))
        break
      case keys.lessons:
        lessons = await ProgressBuilder.new(auth.user)
          .get()
          .posts((builder) => builder.whereLesson().display().paginate(page, 20, route))
        break
      case keys.posts:
        const postTypes = [PostTypes.BLOG, PostTypes.LINK, PostTypes.NEWS, PostTypes.SNIPPET]
        posts = await ProgressBuilder.new(auth.user)
          .get()
          .posts((builder) => builder.whereType(postTypes).display().paginate(page, 20, route))
        break
    }

    return view.render('pages/users/history', { tab, tabs, tabIndex, series, lessons, posts })
  }

  async check({ auth }: HttpContext) {
    return !!auth.user
  }

  async mentionsList({ request, response, auth }: HttpContext) {
    const { pattern } = await request.validateUsing(mentionListValidator)
    const users = await User.query()
      .if(pattern, (query) => query.whereILike('username', `%${pattern}%`))
      .where('isEnabledMentions', true)
      .whereNot('id', auth.user!.id)
      .select('username', 'planId')
      .orderBy('username', 'asc')
      .limit(3)

    return response.json(
      users.map((user) => user.username.toLowerCase()).sort((a, b) => a.localeCompare(b))
    )
  }
}
