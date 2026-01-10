import BaseAction from '#actions/base_action'
import is from '@adonisjs/core/helpers/is'
import { Router } from '@adonisjs/core/http'
import { Constructor, LazyImport } from '@adonisjs/core/types/common'
import { GetControllerHandlers, RouteFn } from '@adonisjs/core/types/http'

declare module '@adonisjs/core/http' {
  interface Router {
    useActionHandlers(): void
  }
}

function isLazyImport(input: any): input is () => Promise<any> {
  const inputString = input.toString()
  
  if (!is.object(input)) return false
  if (!inputString.includes('import(')) return false

  return ['#actions/', '/actions/'].some((segment) => inputString.includes(segment))
}

function isActionClass(input: any): boolean {
  const cls = input.at(0)
  return is.class(cls) && Object.getPrototypeOf(cls) === BaseAction
}

Router.prototype.useActionHandlers = function (this: Router) {
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
}


