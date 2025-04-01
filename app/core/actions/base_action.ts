import ForbiddenException from '#core/exceptions/forbidden_exception'
import NotImplementedException from '#core/exceptions/not_implemented_exception'
import { HttpContext } from '@adonisjs/core/http'
import { Constructor, GetControllerHandlers, LazyImport, RouteFn } from '@adonisjs/core/types/http'
import { VineValidator } from '@vinejs/vine'

interface StaticAction<T> {
  new (): T
}

export function StaticImplements<T>() {
  return (_t: T) => {}
}

export interface BaseActionableStatic {
  new (): BaseActionable
  controller<T extends Constructor<any>>():
    | string
    | RouteFn
    | [LazyImport<T> | T, GetControllerHandlers<T>?]
}

export interface BaseActionable {
  asController?(ctx: HttpContext, data?: unknown): Promise<any>
  authorize?(ctx: HttpContext): Promise<boolean> | boolean
  validator?: VineValidator<any, any>
}

export interface ActionableStatic extends BaseActionableStatic {
  new (): Actionable
}

export interface Actionable extends BaseActionable {}

@StaticImplements<BaseActionableStatic>()
export default class BaseAction implements BaseActionable {
  static controller<T extends BaseActionable>(this: StaticAction<T>) {
    const Action = this

    return async (ctx: HttpContext) => {
      const action = new Action()

      if (typeof action.asController !== 'function') {
        throw new NotImplementedException(`ACTION does not implement asController`)
      }

      if (typeof action.authorize === 'function') {
        const authorized = await action.authorize(ctx)
        if (!authorized) {
          throw new ForbiddenException()
        }
      }

      let data: unknown
      if (action.validator) {
        data = await ctx.request.validateUsing(action.validator)
      }

      return action.asController(ctx, data)
    }
  }
}
