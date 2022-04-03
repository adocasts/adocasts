import { HttpContextContract } from '@ioc:Adonis/Core/HttpContext'
import Taxonomy from "App/Models/Taxonomy";
import TaxonomyValidator from "App/Validators/TaxonomyValidator";
import TaxonomyService from 'App/Services/TaxonomyService'

export default class TaxonomiesController {
  public async index({ view }: HttpContextContract) {
    const taxonomies = await Taxonomy.query()
      .withCount('posts')
      .withCount('collections')

    return view.render('studio/taxonomies/index', { taxonomies })
  }

  public async create({ view, request }: HttpContextContract) {
    const { rootParentId, parentId } = request.qs()
    const parent = parentId ? await Taxonomy.findOrFail(parentId) : null

    return view.render('studio/taxonomies/createOrEdit', {
      rootParentId,
      parentId,
      parent
    })
  }

  public async store({ request, response }: HttpContextContract) {
    const { postIds, ...data } = await request.validate(TaxonomyValidator)

    const taxonomy = await Taxonomy.create(data)

    await TaxonomyService.syncPosts(taxonomy, postIds)

    return response.redirect().toRoute('studio.taxonomies.index')
  }

  public async show({}: HttpContextContract) {}

  public async edit({ view, params }: HttpContextContract) {
    const taxonomy = await Taxonomy.findOrFail(params.id)

    await taxonomy.load('asset')
    await taxonomy.load('posts', query => query.orderBy('pivot_sort_order'))

    return view.render('studio/taxonomies/createOrEdit', { taxonomy })
  }

  public async update({ request, response, params }: HttpContextContract) {
    const taxonomy = await Taxonomy.findOrFail(params.id)
    const { postIds, ...data } = await request.validate(TaxonomyValidator)

    await taxonomy.merge(data).save()
    await TaxonomyService.syncPosts(taxonomy, postIds)

    return response.redirect().toRoute('studio.taxonomies.index')
  }

  public async destroy({ response, params }: HttpContextContract) {
    const taxonomy = await Taxonomy.findOrFail(params.id)
    const flatChildren = await TaxonomyService.getFlatChildren(taxonomy.id)
    const flatChildrenIds = flatChildren.reverse().map(c => c.id)

    await Taxonomy.query().whereIn('id', flatChildrenIds).delete()
    await taxonomy.delete()

    return response.redirect().toRoute('studio.taxonomies.index')
  }
}
