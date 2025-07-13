import { Constructor, GetControllerHandlers, LazyImport, RouteFn } from '@adonisjs/core/types/http'
import BaseAction from '#actions/base_action'
import { Router } from '@adonisjs/core/http'
import is from '@adonisjs/core/helpers/is'

/* eslint-disable */

declare module '@adonisjs/core/http' {
  interface Router {
    useActionHandlers(): void
  }
}

function isLazyImport(input: any): input is () => Promise<any> {
  return is.object(input) && input.toString().includes('import(')
}

function isActionClass(input: any): boolean {
  return is.class(input) && Object.getPrototypeOf(input) === BaseAction
}

Router.macro('useActionHandlers', function(this: Router) {
  const makeRoute = this.route.bind(this)

  this.route = function <T extends Constructor<BaseAction>>(
    pattern: string,
    methods: string[],
    handler: string | RouteFn | [LazyImport<T> | T, GetControllerHandlers<T>?]
  ) {
    let actionHandler = handler

    if (Array.isArray(handler) && (isLazyImport(handler) || isActionClass(handler))) {
      actionHandler = [handler.at(0), 'handleController'] as any
    }

    return makeRoute(pattern, methods, actionHandler)
  }
})
