import type { HttpContext } from '@adonisjs/core/http'

export default class LegalsController {
  
  async cookies({ view }: HttpContext) {
    return view.render('pages/legals/cookies')
  }
  
  async privacy({ view }: HttpContext) {
    return view.render('pages/legals/privacy')
  }
  
  async terms({ view }: HttpContext) {
    return view.render('pages/legals/terms')
  }
  
  async guidelines({ view }: HttpContext) {
    return view.render('pages/legals/guidelines')
  }
  
}