import CollectionBuilder from '#builders/collection_builder'
import Collection from '#models/collection'
import CollectionService from '#services/collection_service'
import HistoryService from '#services/history_service'
import TaxonomyService from '#services/taxonomy_service'
import { inject } from '@adonisjs/core'
import _ from 'lodash'
import type { HttpContext } from '@adonisjs/core/http'
import Status from '#enums/status'

@inject()
export default class SeriesController {
  constructor(
    protected collectionService: CollectionService,
    protected historyService: HistoryService,
    protected taxonomyService: TaxonomyService
  ) {}

  async index({ request, view, history }: HttpContext) {
    let topic = request.input('topic')
    let sort = request.input('sort', 'latest')
    let features = await this.collectionService.getRecentlyUpdated()
    let series = await this.collectionService.getAll()
    let topics = await this.taxonomyService.getForSeriesFilter()

    if (topic) {
      series = series.filter((s) => s.topics && s.topics.some((t) => t.slug === topic))
      topics = topics.map((t) => {
        if (t.slug !== topic) return t
        t.meta.isSelected = true
        return t
      })
    }

    switch (sort) {
      case 'latest':
        series = _.orderBy(series, (item) => item.posts?.at(0)?.publishAtISO, ['desc'])
        break
      case 'duration':
        series = _.orderBy(series, (item) => Number(item.meta.videoSecondsSum), ['desc'])
        break
      case 'lessons':
        series = _.orderBy(series, (item) => Number(item.meta.postsCount), ['desc'])
        break
    }

    await history.commit()

    return view.render('pages/series/index', { features, series, sort, topic, topics })
  }

  async show({ view, params, route, history, auth }: HttpContext) {
    const item = await this.collectionService.getBySlug(params.slug)

    await this.historyService.recordView(item, route?.name)
    await history.commit()

    const nextLesson = this.collectionService.findNextProgressLesson(item, history)

    item.meta.isInWatchlist = await this.collectionService.getIsInWatchlist(auth.user, item)
    item.meta.postCompletedCount = history.records.filter((record) => record.isCompleted).length
    item.meta.totalWatchSeconds = history.records.reduce(
      (sum, record) => sum + record.watchSeconds,
      0
    )

    if (item.statusId === Status.COMING_SOON) {
      return view.render('pages/series/soon', { item })
    }

    return view.render('pages/series/show', { item, nextLesson })
  }

  async lesson({ params, response }: HttpContext) {
    const series = await Collection.query().where('slug', params.slug).firstOrFail()
    const lesson = await series
      .related('postsFlattened')
      .query()
      .where('root_sort_order', params.index - 1)
      .firstOrFail()

    return response.redirect().withQs().toPath(lesson.routeUrl)
  }

  async continue({ params, response, auth }: HttpContext) {
    const series = await CollectionBuilder.new(auth.user)
      .where('slug', params.slug)
      .withPosts('pivot_root_sort_order')
      .firstOrFail()
    const lesson = this.collectionService.findNextLesson(series)!

    return response.redirect().withQs().toPath(lesson.routeUrl!)
  }
}
