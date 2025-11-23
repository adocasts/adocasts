import GetPaginatedSessions from '#actions/auth/get_paginated_sessions'
import BaseAction from '#actions/base_action'
import stripe from '#services/stripe_service'
import { HttpContext } from '@adonisjs/core/http'
import PopulateGitHubUsernameFromId from './populate_github_username_from_id.js'
import SyncUserGitHubTeamMembership from './sync_user_github_team_membership.js'

export default class RenderUserSettings extends BaseAction {
  async asController({ view, request, params, auth }: HttpContext) {
    const section = params.section ?? 'account'
    const user = auth.user!

    if (section === 'account') {
      const sessions = await GetPaginatedSessions.run(user, request.sessionToken)
      view.share({ sessions })

      await PopulateGitHubUsernameFromId.run(user)
      await SyncUserGitHubTeamMembership.run(user)
    }

    if (section === 'billing') {
      const charges = await stripe.getCharges(user)
      const invoices = await stripe.getInvoices(user)
      const subscriptions = await stripe.getSubscriptions(user)
      view.share({ charges, invoices, subscriptions })
    }

    return view.render(`pages/users/settings/${section}`, { section })
  }
}
