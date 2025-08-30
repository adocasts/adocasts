import ForbiddenException from '#exceptions/forbidden_exception'
import NotImplementedException from '#exceptions/not_implemented_exception'
import { inject } from '@adonisjs/core'
import { InvalidArgumentsException } from '@adonisjs/core/exceptions'
import { HttpContext } from '@adonisjs/core/http'
import app from '@adonisjs/core/services/app'
import { RequestValidationOptions } from '@adonisjs/core/types/http'
import { VineValidator } from '@vinejs/vine'

// The StaticAction interface now uses a single generic type for the class
interface StaticAction<T extends BaseAction> {
  new (...args: any[]): T
}

export interface BaseActionable {
  handle?(...args: any[]): any
  asController?(ctx: HttpContext, data?: unknown, ...args: any[]): Promise<any>
  asListener?(...args: any[]): Promise<any>
  authorize?(ctx: HttpContext): Promise<any> | any
  validator?: VineValidator<any, any>
  validatorOptions?: RequestValidationOptions<any>
}

@inject()
export default abstract class BaseAction implements BaseActionable {
  asController?(ctx: HttpContext, ...args: any[]): Promise<any>
  asListener?(...args: any[]): Promise<any>
  authorize?(ctx: HttpContext): Promise<any> | any
  // The 'asController', 'asListener', 'authorize', and 'handle' properties
  // can be removed here to avoid redundancy and let the child class define them.

  // The 'run' method is now a static method that directly infers the `handle`
  // method's argument and return types from the class instance.
  static async run<T extends { handle: (...args: any[]) => any }>(
    this: new (...args: any[]) => T,
    ...args: Parameters<T['handle']>
  ): Promise<ReturnType<T['handle']>> {
    const action = new this()

    if (typeof action.handle !== 'function') {
      throw new NotImplementedException(`${this.name} does not implement 'handle'`)
    }

    // Type-safe call to the handle method
    return action.handle(...args)
  }

  // Other methods like `handleController` remain the same or are slightly modified
  // to remove the explicit `HandleArgs` generic.
  static async handleController<T extends BaseAction>(this: StaticAction<T>, ...args: any[]) {
    const action = await app.container.make(this)

    if (args.at(1) instanceof HttpContext) {
      args.splice(0, 1)
      return action.handleController(args.at(0), ...args.splice(0, 1))
    }

    throw new InvalidArgumentsException(
      `${this.name}.handleController was not provided the HttpContext as expected`
    )
  }

  async handleController<T extends BaseActionable>(this: T, ctx: HttpContext, ...args: any[]) {
    if (typeof this.asController !== 'function') {
      throw new NotImplementedException(
        `${this.constructor.name} does not implement 'asController'`
      )
    }

    if (typeof this.authorize === 'function') {
      const authorized = await this.authorize(ctx)

      if (typeof authorized !== 'undefined') {
        if (!authorized) throw new ForbiddenException()
        args.unshift(authorized)
      }
    }

    let data: unknown
    if (this.validator) {
      data = await ctx.request.validateUsing(this.validator, this.validatorOptions)
    }

    return ctx.containerResolver.call(this, 'asController' as any, [ctx, data, ...args])
  }
}
