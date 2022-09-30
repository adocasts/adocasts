import type { HttpContextContract } from '@ioc:Adonis/Core/HttpContext'
import Block from 'App/Models/Block'

export default class BlocksController {
  public async index({ view }: HttpContextContract) {
    const blocks = await Block.query().preload('user')
    return view.render('studio/blocked/index', { blocks })
  }

  public async create({ view }: HttpContextContract) {
    return view.render('studio/blocked/createOrEdit')
  }
}
