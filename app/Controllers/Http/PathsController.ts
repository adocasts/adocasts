import type { HttpContextContract } from '@ioc:Adonis/Core/HttpContext'
import Collection from 'App/Models/Collection'
import CollectionService from 'App/Services/CollectionService'
import HistoryService from 'App/Services/HistoryService'
import PostService from 'App/Services/PostService'

export default class PathsController {
  public async show({ params, view, auth, route }: HttpContextContract) {
    const series = await CollectionService.getByPathSlug(auth, params.slug)
    const nextLesson = await CollectionService.findNextLesson(auth, series)

    await HistoryService.recordView(auth.user, series, route?.name)

    return view.render('pages/paths/show', { series, nextLesson })
  }

  public async lesson({ params, response }: HttpContextContract) {
    const series = await Collection.query().where('slug', params.slug).firstOrFail()
    const lesson = await series.related('postsFlattened').query().where('root_sort_order', params.index - 1).firstOrFail()

    return response.redirect().toPath(PostService.getPostPath(lesson)!)
  }
}
