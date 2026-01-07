import router from '@adonisjs/core/services/router'
import { type MakeUrlOptions } from '@adonisjs/core/types/http'

export default class FormService {
  static post(
    routeIdentifier: string,
    params?: any[] | Record<string, any> | undefined,
    options?: MakeUrlOptions | undefined
  ) {
    return router.makeUrl(routeIdentifier, params, options)
  }

  static put(
    routeIdentifier: string,
    params?: any[] | Record<string, any> | undefined,
    options?: MakeUrlOptions | undefined
  ) {
    return router.makeUrl(routeIdentifier, params, this.spoof('put', options))
  }

  static patch(
    routeIdentifier: string,
    params?: any[] | Record<string, any> | undefined,
    options?: MakeUrlOptions | undefined
  ) {
    return router.makeUrl(routeIdentifier, params, this.spoof('patch', options))
  }

  static delete(
    routeIdentifier: string,
    params?: any[] | Record<string, any> | undefined,
    options?: MakeUrlOptions | undefined
  ) {
    return router.makeUrl(routeIdentifier, params, this.spoof('delete', options))
  }

  static generateInputId() {
    return '_' + Math.random().toString(36).substr(2, 9)
  }

  private static spoof(method: 'post' | 'put' | 'patch' | 'delete', options: MakeUrlOptions = {}) {
    return {
      ...options,
      qs: {
        ...(options.qs || {}),
        _method: method,
      },
    }
  }
}
