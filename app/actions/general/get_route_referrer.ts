import BaseAction from '#actions/base_action'
import env from '#start/env'
import { HttpRequest } from '@adonisjs/core/http'
import router from '@adonisjs/core/services/router'
import { MatchedRoute } from '@adonisjs/core/types/http'

export interface RouteReferrerInterface {
  referrer: string | null
  route: MatchedRoute | null
}

export default class GetRouteReferrer extends BaseAction {
  handle(requestOrReferrer: HttpRequest | string | undefined): RouteReferrerInterface {
    const result: RouteReferrerInterface = { referrer: null, route: null }

    if (!requestOrReferrer) return result

    try {
      const referrer = this.#getReferrer(requestOrReferrer)

      if (!referrer) return result

      const url = new URL(referrer, env.get('APP_DOMAIN'))
      const route = router.match(url.pathname, 'GET', false)

      if (route) {
        result.referrer = url.pathname + url.search
        result.route = route
      }
    } catch (e) {}

    return result
  }

  #getReferrer(requestOrReferrer: HttpRequest | string) {
    if (typeof requestOrReferrer === 'string') return requestOrReferrer

    return requestOrReferrer.header('referer')
  }
}
