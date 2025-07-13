import BaseAction from '#actions/base_action'
import GetIpAddress from '../../actions/general/get_ip_address.js'
import DiscussionViewTypes from '#enums/discussion_view_types'
import DiscussionView from '#models/discussion_view'
import { HttpContext } from '@adonisjs/core/http'

type HttpContextPartial = Pick<HttpContext, 'request' | 'auth'>

export default class StoreDiscussionView extends BaseAction<[HttpContextPartial, number, number]> {
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
