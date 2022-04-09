import { HttpContextContract } from '@ioc:Adonis/Core/HttpContext'

export default class QuestionsController {
  public async index({ view }: HttpContextContract) {
    return view.render('faq')
  }

  public async vote({}: HttpContextContract) {}
}
