import Plans from '#enums/plans'
import Roles from '#enums/roles'
import Asset from '#models/asset'
import User from '#models/user'
import type { HttpContext } from '@adonisjs/core/http'

export default class CreditsController {
  async handle({ view }: HttpContext) {
    const authors = await User.query()
      .preload('profile')
      .whereHas('posts', (query) => query.apply((scope) => scope.published()))

    const assets = await Asset.query()
      .whereNotNull('credit')
      .where('credit', '!=', '')
      .distinct('credit')

    const subscribers = await User.query()
      .preload('profile')
      .where('planId', '!=', Plans.FREE)
      .where('roleId', '!=', Roles.ADMIN)
      .orderBy('username')

    view.share({ hFull: true })

    return view.render('pages/credits', {
      authors,
      subscribers,
      assets,
    })
  }
}
