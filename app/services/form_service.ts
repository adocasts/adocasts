import router from "@adonisjs/core/services/router"
import { MakeUrlOptions } from "@adonisjs/core/types/http"

export default class FormService {
  public static post(routeIdentifier: string, params?: any[] | Record<string, any> | undefined, options?: MakeUrlOptions | undefined) {
    return router.makeUrl(routeIdentifier, params, options)
  }

  public static put(routeIdentifier: string, params?: any[] | Record<string, any> | undefined, options?: MakeUrlOptions | undefined) {
    return router.makeUrl(routeIdentifier, params, this.spoof('put', options))
  }

  public static patch(routeIdentifier: string, params?: any[] | Record<string, any> | undefined, options?: MakeUrlOptions | undefined) {
    return router.makeUrl(routeIdentifier, params, this.spoof('patch', options))
  }

  public static delete(routeIdentifier: string, params?: any[] | Record<string, any> | undefined, options?: MakeUrlOptions | undefined) {
    return router.makeUrl(routeIdentifier, params, this.spoof('delete', options))
  }

  private static spoof(method: 'post'|'put'|'patch'|'delete', options: MakeUrlOptions = {}) {
    return {
      ...options,
      qs: {
        ...(options.qs || {}),
        _method: method
      }
    }
  }
}