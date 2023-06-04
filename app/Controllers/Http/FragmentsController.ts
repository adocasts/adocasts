import type { HttpContextContract } from '@ioc:Adonis/Core/HttpContext'

export default class FragmentsController {
  public async index({ params, view }: HttpContextContract) {
    return view.render(`components/fragments/${params.fragment}`)
  }

  public async show({ params, view }: HttpContextContract) {
    return view.render(`components/fragments/${params.fragment}`, { id: params.id })
  }
}
