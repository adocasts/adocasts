import type { HttpContextContract } from '@ioc:Adonis/Core/HttpContext'
import PostService from "App/Services/PostService";
import CollectionService from "App/Services/CollectionService";
import TaxonomyService from "App/Services/TaxonomyService";
import Route from "@ioc:Adonis/Core/Route";

export default class SearchController {
  public async index({ request, view }: HttpContextContract) {
    const pattern = await request.input('pattern')
    const posts = await PostService.search(pattern)
    const series = await CollectionService.search(pattern)
    const topics = await TaxonomyService.search(pattern)

    return view.render('pages/search/index', {
      pattern,
      posts,
      series,
      topics
    })
  }

  public async search({ request, response, view }: HttpContextContract) {
    const pattern = await request.input('pattern')
    const posts = await PostService.search(pattern)
    const series = await CollectionService.search(pattern)
    const topics = await TaxonomyService.search(pattern)
    const newPath = Route.makeUrl('search.index', {}, { qs: { pattern } })

    response.header('HX-Push-Url', newPath)

    return view.render('components/search/results', {
      pattern,
      posts,
      series,
      topics
    })
  }
}
