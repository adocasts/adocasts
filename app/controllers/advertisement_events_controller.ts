import AdvertisementEvent from '#models/advertisement_event'
import IdentityService from '#services/identity_service'
import PlatformService from '#services/platform_service'
import SessionService from '#services/session_service'
import { URL } from 'node:url'
import { advertisementEventValidator } from '#validators/advertisement_event_validator'
import { inject } from '@adonisjs/core'
import type { HttpContext } from '@adonisjs/core/http'
import { DateTime } from 'luxon'
import AnalyticTypes from '#enums/analytic_types'

@inject()
export default class AdvertisementEventsController {
  constructor(protected sessionService: SessionService) {}
  async impression({ request, response, params }: HttpContext) {
    const { ipAddress, userAgent } = this.sessionService
    const identity = await IdentityService.getIdentity(ipAddress!, userAgent!)
    const payload = await request.validateUsing(advertisementEventValidator)
    const latest = await AdvertisementEvent.query()
      .where('createdAt', '>=', DateTime.now().minus({ seconds: 30 }).toSQL())
      .where('identity', identity)
      .where('advertisementId', params.id)
      .orderBy('createdAt', 'desc')
      .first()

    if (latest) {
      return response.status(204)
    }

    const platform = PlatformService.parse(userAgent!)
    const referer = request.header('referer')
    const data: Partial<AdvertisementEvent> = {}

    if (referer) {
      const view = new URL(referer)
      data.host = view.host
      data.path = view.pathname
    }

    await AdvertisementEvent.create({
      ...payload,
      ...platform,
      ...data,
      identity,
      advertisementId: params.id,
      typeId: AnalyticTypes.IMPRESSION,
    })

    return response.status(200)
  }

  async click({ request, response, params }: HttpContext) {
    const { ipAddress, userAgent } = this.sessionService
    const identity = await IdentityService.getIdentity(ipAddress!, userAgent!)
    const payload = await request.validateUsing(advertisementEventValidator)
    const platform = PlatformService.parse(userAgent!)
    const referer = request.header('referer')
    const data: Partial<AdvertisementEvent> = {}

    if (referer) {
      const view = new URL(referer)
      data.host = view.host
      data.path = view.pathname
    }

    await AdvertisementEvent.create({
      ...payload,
      ...platform,
      ...data,
      identity,
      advertisementId: params.id,
      typeId: AnalyticTypes.CLICK,
    })

    return response.status(200)
  }
}
