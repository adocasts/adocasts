import type { HttpContextContract } from '@ioc:Adonis/Core/HttpContext'

export default class LegalsController {
  public async cookies({ view }: HttpContextContract) {
    return view.render('pages/legals/cookies')
  }

  public async terms({ view }: HttpContextContract) {
    return view.render('pages/legals/terms')
  }

  public async privacy({ view }: HttpContextContract) {
    return view.render('pages/legals/privacy')
  }

  public async guidelines({ view }: HttpContextContract) {
    return view.render('pages/legals/guidelines')
  }
}
