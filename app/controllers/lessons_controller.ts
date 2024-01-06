import HttpStatus from '#enums/http_statuses'
import AdService from '#services/ad_service'
import AnalyticsService from '#services/analytics_service'
import CacheService from '#services/cache_service'
import CollectionService from '#services/collection_service'
import DiscussionService from '#services/discussion_service'
import HistoryService from '#services/history_service'
import PermissionService from '#services/permission_service'
import PostService from '#services/post_service'
import { inject } from '@adonisjs/core'
import { Exception } from '@adonisjs/core/exceptions'
import type { HttpContext } from '@adonisjs/core/http'
import emitter from '@adonisjs/core/services/emitter'
import router from '@adonisjs/core/services/router'
import axios from 'axios'
import { DateTime } from 'luxon'
import VttService from '#services/vtt_service'

@inject()
export default class LessonsController {
  constructor(
    protected postService: PostService,
    protected collectionService: CollectionService,
    protected permissionService: PermissionService,
    protected historyService: HistoryService,
    protected discussionService: DiscussionService
  ) {}

  async index({ view, request, params }: HttpContext) {
    const { page = '1', sortBy = 'publishAt', sort = 'desc' } = request.qs()

    if (page === '1' && sortBy === 'publishAt') {
      const recentDate = DateTime.now().minus({ days: 30 }).startOf('day')
      const recent = await this.postService.getLatestLessons().where('publishAt', '>=', recentDate)

      view.share({ title: 'Lessons', recent })
    }

    const items = await this.postService
      .getLessons()
      .orderBy(sortBy, sort)
      .paginate(page, 20, router.makeUrl('lessons.index', params))

    const adAside = await AdService.getMediumRectangles()
    const feed = await this.discussionService.getAsideList(4)

    return view.render('pages/lessons/index', { type: 'Lessons', items, feed, adAside })
  }

  async streams({ view, request, params }: HttpContext) {
    const { page = '1', sortBy = 'publishAt', sort = 'desc' } = request.qs()

    if (page === '1' && sortBy === 'publishAt') {
      const recentDate = DateTime.now().minus({ days: 30 }).startOf('day')
      const recent = await this.postService.getLatestStreams().where('publishAt', '>=', recentDate)

      view.share({ title: 'Livestreams', recent })
    }

    const items = await this.postService
      .getStreams()
      .orderBy(sortBy, sort)
      .paginate(page, 20, router.makeUrl('lessons.index', params))

    const adAside = await AdService.getMediumRectangles()
    const feed = await this.discussionService.getAsideList()

    return view.render('pages/lessons/index', { type: 'Livestreams', items, feed, adAside })
  }

  async show({ view, request, params, session, auth, up, route, bouncer }: HttpContext) {
    const post = await this.postService.findBy('slug', params.slug)
    const series = await this.collectionService.findForPost(post, params.collectionSlug)

    let nextLesson = this.collectionService.findNextSeriesLesson(series, post)
    let prevLesson = this.collectionService.findPrevSeriesLesson(series, post)

    if (
      post.isNotViewable &&
      !auth.user?.isAdmin &&
      !post.authors.some((a) => a.id === auth.user?.id)
    ) {
      throw new Exception('this post is not currently available to the public', {
        status: HttpStatus.NOT_FOUND,
      })
    } else if (!post.isViewable && (await bouncer.with('PostPolicy').denies('viewFutureDated'))) {
      view.share({ nextLesson, prevLesson, post, series })
      return view.render('pages/lessons/soon', { post, series })
    }

    const userProgression = post.progressionHistory?.at(0)
    const comments = post.comments
    const commentCount = post.$extras.comments_count
    const views = await AnalyticsService.getPageViews(request.url())
    const adLeaderboard = await AdService.getLeaderboard()
    const adAside = await AdService.getMediumRectangles(2)

    if (!series) {
      const similarLessons = await this.postService.getSimilarPosts(post)

      nextLesson = similarLessons.at(0)

      view.share({ similarLessons })
    }

    if (post.transcriptUrl) {
      const transcript = await CacheService.try(
        `TRANSCRIPT:${post.id}`,
        async () => {
          const { data: vtt } = await axios.get(post.transcriptUrl!)
          return VttService.parse(vtt)
        },
        CacheService.oneDay
      )

      view.share({ transcript })
    }

    const hasPlayerId = session.has('videoPlayerId')

    if (
      !up.isUnpolyRequest ||
      !hasPlayerId ||
      (hasPlayerId && session.get('videoPlayerId') !== post.id)
    ) {
      up.addTarget('[up-player]')
    }

    await this.historyService.recordView(post, route?.name)

    session.put('videoPlayerId', post.id)

    view.share({
      nextLesson,
      prevLesson,
      post,
      series,
      userProgression,
    })

    await emitter.emit('post:sync', { post, views })

    return view.render('pages/lessons/show', {
      comments,
      commentCount,
      views,
      adLeaderboard,
      adAside,
    })
  }
}

