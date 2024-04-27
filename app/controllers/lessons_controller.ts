import HttpStatus from '#enums/http_statuses'
import AdService from '#services/ad_service'
import CacheService from '#services/cache_service'
import CollectionService from '#services/collection_service'
import DiscussionService from '#services/discussion_service'
import HistoryService from '#services/history_service'
import PermissionService from '#services/permission_service'
import PostService from '#services/post_service'
import { inject } from '@adonisjs/core'
import { Exception } from '@adonisjs/core/exceptions'
import type { HttpContext } from '@adonisjs/core/http'
import router from '@adonisjs/core/services/router'
import axios from 'axios'
import VttService from '#services/vtt_service'
import logger from '#services/logger_service'
import { PostListVM } from '../view_models/post.js'
import Comment from '#models/comment'
import States from '#enums/states'

@inject()
export default class LessonsController {
  constructor(
    protected postService: PostService,
    protected collectionService: CollectionService,
    protected permissionService: PermissionService,
    protected historyService: HistoryService,
    protected discussionService: DiscussionService
  ) {}

  async index({ view, request, params, history }: HttpContext) {
    const { page = '1', sortBy = 'publishAt', sort = 'desc' } = request.qs()

    if (page === '1' && sortBy === 'publishAt') {
      const recent = await this.postService.getCachedNewThisMonth()

      view.share({ title: 'Lessons', recent })
    }

    const items = await this.postService
      .getLessons()
      .orderBy(sortBy, sort)
      .selectListVM()
      .paginate(page, 20, router.makeUrl('lessons.index', params))

    const rows = items.map(post => new PostListVM(post))
    const adAside = await AdService.getMediumRectangles()
    const feed = await this.discussionService.getAsideList(4)

    await history.commit()

    return view.render('pages/lessons/index', { type: 'Lessons', items, rows, feed, adAside })
  }

  async streams({ view, request, params, history }: HttpContext) {
    const { page = '1', sortBy = 'publishAt', sort = 'desc' } = request.qs()
    const items = await this.postService
      .getStreams()
      .orderBy(sortBy, sort)
      .selectListVM()
      .paginate(page, 20, router.makeUrl('lessons.index', params))

    const rows = items.map(post => new PostListVM(post))
    const adAside = await AdService.getMediumRectangles()
    const feed = await this.discussionService.getAsideList()

    await history.commit()

    return view.render('pages/lessons/index', { type: 'Livestreams', items, rows, feed, adAside })
  }

  async show({ view, params, session, auth, up, route, bouncer, history }: HttpContext) {
    const post = await this.postService.findCachedBySlug(params.slug)
    const series = await this.collectionService.getCachedForPost(post, params.collectionSlug)

    let nextLesson = this.collectionService.findNextSeriesLesson(series, post)
    let prevLesson = this.collectionService.findPrevSeriesLesson(series, post)

    if (
      !PostService.getIsViewable(post) &&
      !auth.user?.isAdmin &&
      post.author.id !== auth.user?.id
    ) {
      throw new Exception('this post is not currently available to the public', {
        status: HttpStatus.NOT_FOUND,
      })
    } else if (!PostService.getIsPublished(post) && (await bouncer.with('PostPolicy').denies('viewFutureDated'))) {
      view.share({ nextLesson, prevLesson, post, series })
      await history.commit()
      return view.render('pages/lessons/soon', { post, series })
    }

    const comments = await Comment.query()
      .where('postId', post.id)
      .whereIn('stateId', [States.PUBLIC, States.ARCHIVED])
      .preload('user')
      .preload('userVotes', (query) => query.select('id'))
      .orderBy('createdAt')

    const commentCountResults = await Comment.query()
      .where('postId', post.id)
      .where('stateId', States.PUBLIC)
      .count('*', 'total')
      .first()
      
    const commentCount = commentCountResults?.$extras.total || 0
    const adLeaderboard = await AdService.getLeaderboard()
    const adAside = await AdService.getMediumRectangles(2)

    post.meta.isInWatchlist = await this.postService.getIsInWatchlist(auth.user, post)

    if (post.transcriptUrl) {
      const transcript = await CacheService.try(
        `TRANSCRIPT:${post.id}`,
        async () => {
          try {
            const { data: vtt } = await axios.get(post.transcriptUrl!)
            return VttService.parse(vtt)
          } catch (error) {
            await logger.warn(`Failed to get transcript for ${post.slug}`, error.message)
            return ''
          }
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
    await history.commit()
    
    const userProgression = history.post(post.id)

    session.put('videoPlayerId', post.id)

    view.share({
      nextLesson,
      prevLesson,
      post,
      series,
      userProgression,
    })

    return view.render('pages/lessons/show', {
      comments,
      commentCount,
      adLeaderboard,
      adAside,
    })
  }
}
