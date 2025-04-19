import BaseAction from '#core/actions/base_action'
import GetIpAddress from '#core/actions/get_ip_address'
import DiscussionViewTypes from '#discussion/enums/discussion_view_types'
import DiscussionView from '#discussion/models/discussion_view'
import { HttpContext } from '@adonisjs/core/http'

type HttpContextPartial = Pick<HttpContext, 'request' | 'auth'>

export default class StoreDiscussionView extends BaseAction<[HttpContextPartial, number, number]> {
  async handle({ request, auth }: HttpContextPartial, type: DiscussionViewTypes, id: number) {
    await DiscussionView.create({
      discussionId: id,
      typeId: type,
      userId: auth.user?.id,
      ipAddress: GetIpAddress.run(request),
      userAgent: request.header('user-agent'),
    })
  }
}
