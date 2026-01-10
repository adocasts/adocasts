import BaseAction from '#actions/base_action'
import DiscussionViewTypes from '#enums/discussion_view_types'
import DiscussionView from '#models/discussion_view'
import { HttpContext } from '@adonisjs/core/http'
import GetIpAddress from '../../actions/general/get_ip_address.js'

type HttpContextPartial = Pick<HttpContext, 'request' | 'auth'>

export default class StoreDiscussionView extends BaseAction {
  async handle({ request, auth }: HttpContextPartial, type: DiscussionViewTypes, id: number) {
    await DiscussionView.create({
      discussionId: id,
      typeId: type,
      userId: auth.user?.id,
      ipAddress: await GetIpAddress.run(request),
      userAgent: request.header('user-agent'),
    })
  }
}
